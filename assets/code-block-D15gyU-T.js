import{t as e}from"./code-block-CyWHBwUz.js";import{i as t}from"./_kit-whtJTf_2.js";import{_ as n}from"./index-kjJGCf8a.js";var r=n(),i=`import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Usage
const query = useDebouncedValue(search, 300);
const results = useSearch(query);
`,a=`npm install ryan-ui motion lucide-react
npx ryan-ui add button dialog`;function o(){return(0,r.jsxs)(t,{width:560,gap:5,children:[(0,r.jsx)(e,{filename:`use-debounced-value.ts`,language:`tsx`,code:i,maxLines:9}),(0,r.jsx)(e,{language:`bash`,code:a})]})}export{o as default};