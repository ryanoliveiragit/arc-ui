import { JsonViewer } from "@/registry/components/json-viewer/json-viewer";
import order from "./json-viewer-data.json";
import styles from "./json-viewer.module.css";

export default function JsonViewerDemo() {
  return (
    <div className={styles.demo}>
      <div className={styles.request}>
        <span className={styles.method}>GET</span>
        <code className={styles.url}>/v1/orders/{order.id}</code>
        <span className={styles.status}><span className={styles.dot} aria-hidden="true" />200</span>
        <span className={styles.time}>84 ms</span>
      </div>
      <JsonViewer
        data={order}
        rootName="order"
        maxHeight={380}
        label="Order response"
        onCopy={(detail) => { void navigator.clipboard?.writeText(detail.text); }}
      />
      <p className={styles.note}>Try searching for <code>refund</code>, then use the arrow keys</p>
    </div>
  );
}
