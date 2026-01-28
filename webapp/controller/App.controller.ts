import type Router from "sap/ui/core/routing/Router";
import Base from "./Base.controller";
import type { Router$RouteMatchedEvent } from "sap/ui/core/routing/Router";
import type { FlexibleColumnLayout$StateChangeEvent } from "sap/f/FlexibleColumnLayout";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type { RouteArguments } from "../types/pages/main";

/**
 * @namespace com.sphinxjsc.shopping1.controller
 */
export default class App extends Base {
  private router: Router;

  currentRouteName?: string;
  currentProduct?: string;
  currentSupplier?: string;

  /*eslint-disable @typescript-eslint/no-empty-function*/
  public override onInit(): void {
    this.router = this.getRouter();

    this.router.attachRouteMatched(this.onRouteMatched, this);
    // this.router.navTo(
    //   "detail",
    //   {
    //     step: "STEP01",
    //     substep: "SSTEP01",
    //     layout: "TwoColumnsMidExpanded",
    //   },
    //   true
    // );
  }

  private onRouteMatched = (event: Router$RouteMatchedEvent) => {
    let routerName = event.getParameter("name");
    const argument = <RouteArguments>event.getParameter("arguments");

    this.updateUIElements();

    this.currentRouteName = routerName;
    this.currentProduct = argument.step;
    this.currentSupplier = argument.substep;
  };

  public onStateChanged(event: FlexibleColumnLayout$StateChangeEvent): void {
    const isNavigationArrow = event.getParameter("isNavigationArrow");
    const layout = event.getParameter("layout");

    this.updateUIElements();

    if (isNavigationArrow && layout && this.currentRouteName) {
      this.router.navTo(
        this.currentRouteName,
        {
          layout: layout,
          step: this.currentProduct,
          substep: this.currentSupplier,
        },
        true
      );
    }
  }

  private updateUIElements(): void {
    const component = this.getComponent();
    if (!component) {
      return;
    }
    const model = <JSONModel>component.getModel("ui");
    if (!model) {
      return;
    }

    const uiState = component.getFCLHelper().getCurrentUIState();

    model.setData(uiState);
  }

  public override onExit(): void {
    this.router.detachRouteMatched(this.onRouteMatched, this);
  }
}
