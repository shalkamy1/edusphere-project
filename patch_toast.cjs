const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const toastCode = `export const ToastCtx = createContext({ showToast: () => {} });
export const useToast = () => useContext(ToastCtx);`;

if (!content.includes('ToastCtx')) {
  content = content.replace(
    /export const useLang = \(\) => useContext\(LangCtx\);/,
    `export const useLang = () => useContext(LangCtx);\n\n${toastCode}`
  );
  
  // also add the ToastCtx Provider state and wrap rendering
  // the user might have added it around the app. Let's just create an empty provider or simply add it.
  content = content.replace(
    /export default function App\(\) \{/,
    `export default function App() {
  const [toasts, setToasts] = useState([]);
  const showToast = (msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
  };`
  );

  content = content.replace(
    /<LangCtx.Provider value={{ t, lang, setLang }}>/g,
    `<LangCtx.Provider value={{ t, lang, setLang }}>
      <ToastCtx.Provider value={{ showToast }}>`
  );

  content = content.replace(
    /<\/LangCtx.Provider>/g,
    `      </ToastCtx.Provider>
    </LangCtx.Provider>`
  );

  fs.writeFileSync('src/App.jsx', content);
  console.log('Added Toast Provider');
} else {
  console.log('Already has ToastCtx');
}
