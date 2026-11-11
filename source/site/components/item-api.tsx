import { Section, TableCard } from "@/site/components/item-ui";
import styles from "./item-api.module.css";

/** A seção "Referência da API": as props de cada componente exportado, tiradas de api/<nome>.json (ver scripts/build-api.mjs). */

export interface ApiMember { name: string; optional: boolean; type: string; doc: string }
export interface ApiType { name: string; exported: boolean; kind: "interface" | "type"; doc: string; extends?: string[]; members?: ApiMember[]; text?: string }
export interface ApiComponent { name: string; doc: string; props: string; defaults: Record<string, string> }
export interface ApiData { exports: { name: string; kind: string; default?: boolean }[]; components: ApiComponent[]; types: ApiType[] }

const exportKind: Record<string, string> = { hook: "hook", function: "função", const: "valor" };
const Dash = () => <span className={styles.dash}>—</span>;

/** Separa por vírgula só no primeiro nível (fora de <>, (), {} e []). */
function splitTop(text: string): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let index = 0; index < text.length; index++) {
    const char = text[index]!;
    if ("<({[".includes(char)) depth++;
    else if (">)}]".includes(char) && text[index - 1] !== "=") depth--;
    else if (char === "," && depth === 0) { parts.push(text.slice(start, index).trim()); start = index + 1; }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

/** `Omit<X, "a" | "b">` vira o tipo base X e a lista do que ficou de fora, que vai para a descrição em vez de pesar no chip. */
function readInherited(entry: string): { base: string; omitted: string[] } {
  const match = /^Omit<([\s\S]+)>$/.exec(entry.trim());
  const args = match ? splitTop(match[1]!) : [];
  if (args.length !== 2) return { base: entry, omitted: [] };
  return { base: args[0]!, omitted: [...args[1]!.matchAll(/"([^"]+)"|'([^']+)'/g)].map(found => found[1] ?? found[2]!) };
}

/** "a, b e c", com cada nome num chip. */
function codeList(names: string[]) {
  return names.map((name, index) => <span key={name}>{index === 0 ? "" : index === names.length - 1 ? " e " : ", "}<code className={styles.chip}>{name}</code></span>);
}

/** Tabela de props de um componente; sem `defaults`, é a tabela de campos de um tipo (não há coluna "Padrão"). */
function PropsTable({ label, type, defaults, aliases }: { label: string; type: ApiType; defaults?: Record<string, string>; aliases: Map<string, string> }) {
  const members = type.members ?? [];
  const inherited = (type.extends ?? []).map(readInherited);
  const omitted = inherited.flatMap(entry => entry.omitted);
  return (
    <TableCard label={label} className={styles.card}>
      <table className={styles.table} data-columns={defaults ? 4 : 3}>
        <thead>
          <tr><th scope="col">{defaults ? "Prop" : "Campo"}</th><th scope="col">Tipo</th>{defaults ? <th scope="col">Padrão</th> : null}<th scope="col">Descrição</th></tr>
        </thead>
        <tbody>
          {members.map(member => {
            // Um tipo com nome (`ButtonVariant`) mostra o que ele vale, quando é curto: é o que a pessoa precisa para escrever a prop.
            const expanded = aliases.get(member.type);
            return (
              <tr key={member.name}>
                <th scope="row"><code className={styles.prop}>{member.name}</code>{member.optional ? null : <span className={styles.required}>obrigatória</span>}</th>
                <td><code className={styles.chip} title={expanded ? member.type : undefined}>{expanded ?? member.type}</code></td>
                {defaults ? <td>{defaults[member.name] ? <code className={styles.chip}>{defaults[member.name]}</code> : <Dash />}</td> : null}
                <td className={styles.text}>{member.doc || <Dash />}</td>
              </tr>
            );
          })}
          {inherited.length ? (
            <tr>
              <th scope="row"><code className={styles.prop}>...props</code></th>
              <td>{inherited.map(entry => <code key={entry.base} className={styles.chip}>{entry.base}</code>)}</td>
              {defaults ? <td><Dash /></td> : null}
              <td className={styles.text}>Também aceita as props {inherited.length === 1 ? "deste tipo" : "destes tipos"}{omitted.length ? <>, menos {codeList(omitted)}</> : null}.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </TableCard>
  );
}

export function ApiSection({ api }: { api: ApiData }) {
  const { components, types, exports } = api;
  const typeByName = new Map(types.map(type => [type.name, type]));
  /** Tipos que são só um apelido curto de outra coisa: `ButtonSize` → `"sm" | "md" | "lg"`. */
  const aliases = new Map(types.filter(type => type.kind === "type" && !type.members?.length && type.text && type.text.length <= 120).map(type => [type.name, type.text!]));
  const usedAsProps = new Set(components.map(component => component.props));
  const otherTypes = types.filter(type => type.exported && !usedAsProps.has(type.name));
  /** Tipos com campos ganham tabela própria; os que são só uma definição curta vão juntos num cartão de duas colunas. */
  const shapes = otherTypes.filter(type => type.members?.length);
  const definitions = otherTypes.filter(type => !type.members?.length && type.text);
  const otherExports = exports.filter(entry => entry.kind !== "component");
  if (!components.length && !otherTypes.length && !otherExports.length) return null;

  return (
    <Section id="api" title="Referência da API" intro="Extraída do código-fonte. As descrições das props vêm dos comentários do código e estão em inglês.">
      <div className={styles.blocks}>
        {components.map(component => {
          const type = typeByName.get(component.props);
          const hasRows = Boolean(type?.members?.length || type?.extends?.length);
          return (
            <div key={component.name} className={styles.block}>
              <h3 className={styles.name}>{component.name}</h3>
              {component.doc ? <p className={styles.doc}>{component.doc}</p> : null}
              {type && hasRows ? <PropsTable label={`Props de ${component.name}`} type={type} defaults={component.defaults} aliases={aliases} />
                : type?.text ? <p className={styles.doc}>Props: <code className={styles.chip}>{type.text}</code></p>
                : <p className={styles.doc}>Sem props próprias: aceita as do elemento ou do primitivo que envolve.</p>}
            </div>
          );
        })}
        {shapes.length || definitions.length ? (
          <div className={styles.block}>
            <h3 className={styles.groupTitle}>Tipos exportados</h3>
            {definitions.length ? (
              <TableCard label="Tipos exportados" className={styles.card}>
                <table className={styles.table} data-columns={2}>
                  <thead><tr><th scope="col">Tipo</th><th scope="col">Definição</th></tr></thead>
                  <tbody>
                    {definitions.map(type => (
                      <tr key={type.name}>
                        <th scope="row"><code className={styles.prop}>{type.name}</code>{type.doc ? <span className={styles.rowDoc}>{type.doc}</span> : null}</th>
                        <td><code className={styles.chip}>{type.text}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            ) : null}
            {shapes.map(type => (
              <div key={type.name} className={styles.typeBlock}>
                <h4 className={styles.name}>{type.name}</h4>
                {type.doc ? <p className={styles.doc}>{type.doc}</p> : null}
                <PropsTable label={`Campos de ${type.name}`} type={type} aliases={aliases} />
              </div>
            ))}
          </div>
        ) : null}
        {otherExports.length ? (
          <div className={styles.block}>
            <h3 className={styles.groupTitle}>Outras exportações</h3>
            <ul className={styles.exports}>
              {otherExports.map(entry => <li key={entry.name}><code className={styles.prop}>{entry.name}</code><span className={styles.dash}>{exportKind[entry.kind] ?? entry.kind}</span></li>)}
            </ul>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
