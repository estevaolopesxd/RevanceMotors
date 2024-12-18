import React from 'react';
import { Navigate, useLocation, NavLink } from 'react-router-dom';

// Função para obter o usuário do sessionStorage
const getUser = () => {
  const storedUser = sessionStorage.getItem('user');
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Erro ao parsear o usuário do sessionStorage:", error);
  }
  return user;
};

// Componente PermissionGate
const PermissionGate = ({ allowedRoutes = [], allowedMenuItems = [], children }) => {
  const user = getUser();
  const location = useLocation();
  const currentPath = location.pathname;

  // Verifica permissão para rotas
  const hasRoutePermission = allowedRoutes.length === 0 || (user && allowedRoutes.includes(user.permissao));

  // Verifica permissão para menu
  const hasMenuPermission = (item) => {
    if (item.allowedPermissions.length === 0) return true;
    return user && item.allowedPermissions.includes(user.permissao);
  };

  // Renderiza o componente de acordo com a permissão
  if (currentPath && !hasRoutePermission) {
    return <Navigate to="/login" />;
  }

  // Renderiza os itens de menu permitidos
  const filteredMenuItems = allowedMenuItems.filter(hasMenuPermission);

  return (
    <div>
      {filteredMenuItems.map((item, index) => (
        <NavLink key={index} to={item.route} style={{ textDecoration: 'none' }}>
          {item.icon}
          {item.id}
        </NavLink>
      ))}
      {children}
    </div>
  );
};

export default PermissionGate;
