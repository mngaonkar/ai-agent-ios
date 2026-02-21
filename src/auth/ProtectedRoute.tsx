import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { authEnabled } from './authConfig';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const ProtectedRouteWithAuth: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated) {
          return <Component {...props} />;
        }

        return <Redirect to="/login" />;
      }}
    />
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  if (!authEnabled) {
    return <Route {...rest} render={(props) => <Component {...props} />} />;
  }

  return <ProtectedRouteWithAuth component={Component} {...rest} />;
};

export default ProtectedRoute;
