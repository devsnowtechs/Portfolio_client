import { Routes } from "@angular/router";
// One page, published on its own host: every path shows the profile, so a shared link always lands
// on the person instead of a not-found screen.
export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./public/layout").then((m) => m.ProfileLayout),
    children: [
      {
        path: "",
        pathMatch: "full",
        loadComponent: () => import("./public/home").then((m) => m.ProfileHome),
      },
      { path: "**", redirectTo: "" },
    ],
  },
];
