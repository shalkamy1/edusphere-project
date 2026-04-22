const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(
  "import { logout as apiLogout, getToken, getStoredUser, clearAuth, adviseStudent } from './api.js';",
  "import { logout as apiLogout, getToken, getStoredUser, clearAuth, adviseStudent, getCurrentUser, saveAuth } from './api.js';"
);

content = content.replace(
  '<div className="uavt">{initials}</div>',
  `{userInfo?.profile_picture_url ? (
            <img src={userInfo.profile_picture_url} className="uavt" style={{ padding: 0, objectFit: 'cover', background: 'white' }} alt="Avatar" />
          ) : (
            <div className="uavt">{initials}</div>
          )}`
);

content = content.replace(
  /const navigateTo = setPage;/g,
  `const navigateTo = setPage;

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        let user = getStoredUser();
        if (token && user) {
          setUserInfo(user);
          setLoggedIn(true);
        }
        
        if (token) {
          const latestUser = await getCurrentUser();
          if (latestUser) {
            setUserInfo(latestUser);
            setLoggedIn(true);
            saveAuth(token, latestUser);
          }
        }
      } catch (err) {
        console.error('Failed auth restore', err);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);`
);

content = content.replace(
  /if \(!loggedIn\) \{/g,
  `if (authLoading) return null;

  if (!loggedIn) {`
);

fs.writeFileSync('src/App.jsx', content);
console.log('App patched properly.');
