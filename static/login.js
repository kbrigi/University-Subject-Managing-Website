// changes the visibiity of the password
function setVisibility(togglePassword, password) {
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);

  // change icon
  togglePassword.classList.toggle('bi-eye');
}
// login and registration password
function passwordVisibility() {
  const togglePassword = document.getElementById('togglePassword');
  const password = document.getElementById('password');

  setVisibility(togglePassword, password);
}
// registration repeated password
function passwordVisibility2() {
  const togglePassword = document.getElementById('togglePassword2');
  const password = document.getElementById('password2');

  setVisibility(togglePassword, password);
}
