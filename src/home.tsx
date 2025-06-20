import { Outlet } from "react-router-dom";
import { Rows } from "@canva/app-ui-kit";

import * as styles from "styles/components.css";

export const Home = () => (
  <div className={styles.scrollContainer}>
    <Rows spacing="3u">
      <Outlet />

    </Rows>
  </div>
);
