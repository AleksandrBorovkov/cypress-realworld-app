import React, { useEffect } from "react";
import { useService, useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import PrivateRoutesContainer from "./PrivateRoutesContainer";
//import { withAuthenticationRequired, useAuth0 } from "@auth0/auth0-react";
import { useAuth0 } from "@auth0/auth0-react";

// @ts-ignore
if (window.Cypress) {
  // Expose authService on window for Cypress
  // @ts-ignore
  window.authService = authService;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
}));

const AppAuth0: React.FC = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const classes = useStyles();
  const [authState] = useService(authService);
  const [, , notificationsService] = useMachine(notificationsMachine);

  const [, , snackbarService] = useMachine(snackbarMachine);

  const [, , bankAccountsService] = useMachine(bankAccountsMachine);

  useEffect(() => {
    (async function waitForToken() {
      const token = await getAccessTokenSilently();
      authService.send("AUTH0", { user, token });
    })();
  }, [user, getAccessTokenSilently]);

  const isLoggedIn =
    isAuthenticated &&
    (authState.matches("authorized") ||
      authState.matches("refreshing") ||
      authState.matches("updating"));

  return (
    <div className={classes.root}>
      <CssBaseline />

      {isLoggedIn && (
        <PrivateRoutesContainer
          isLoggedIn={isLoggedIn}
          notificationsService={notificationsService}
          authService={authService}
          snackbarService={snackbarService}
          bankAccountsService={bankAccountsService}
        />
      )}

      <AlertBar snackbarService={snackbarService} />
    </div>
  );
};

export default AppAuth0;
