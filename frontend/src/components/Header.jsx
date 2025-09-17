import { Link } from 'react-router-dom'

function Header() {
  return (
    <header>
      <nav>
        <Link to="/contacts">Contacts</Link> |
        <Link to="/login"> Login</Link> |
        <Link to="/register"> Register</Link>
      </nav>
    </header>
  )
}

export default Header
