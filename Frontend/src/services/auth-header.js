export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token'); // For backward compatibility

  if (user?.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
} 