import BaseComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";
import { type ComponentData, type Dict } from "./types/utils";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import Device from "sap/ui/Device";
import Control from "sap/ui/core/Control";
import View from "sap/ui/core/mvc/View";
import Messaging from "sap/ui/core/Messaging";
import ControlMessageProcessor from "sap/ui/core/message/ControlMessageProcessor";
import { ErrorHandler } from "./controller/ErrorHandler";
import MessageProcessor from "sap/ui/core/message/MessageProcessor";
import JSONModel from "sap/ui/model/json/JSONModel";
import FlexibleColumnLayoutSemanticHelper from "sap/f/FlexibleColumnLayoutSemanticHelper";
import { LayoutType } from "sap/f/library";
import type { Router$BeforeRouteMatchedEvent } from "sap/ui/core/routing/Router";
import type Router from "sap/ui/core/routing/Router";
import type ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type { ODataError, ODataReadResult } from "./types/odata";
import type { ODataStep } from "./types/pages/main";

/**
 * @namespace com.sphinxjsc.shopping1
 */
export default class Component extends BaseComponent {
  public static metadata = {
    manifest: "json",
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
  };
  private router: Router;

  private MessageManager: Messaging;
  private MessageProcessor: MessageProcessor;
  private ErrorHandler: ErrorHandler;

  public override init(): void {
    // call the base component's init function
    super.init();

    this.setModel(
      new JSONModel({
        MessageTitle: "",
        MessageDescription: "",
      }),
      "global"
    );

    this.setModel(
      new JSONModel({
        steps: [],
      }),
      "workflow"
    );

    this.loadWorkflow();

    // Message manager
    this.MessageManager = Messaging;
    this.MessageProcessor = new ControlMessageProcessor();
    this.MessageManager.registerMessageProcessor(this.MessageProcessor);

    this.ErrorHandler = new ErrorHandler(this);

    this.setModel(this.MessageManager.getMessageModel(), "message");

    // UI model cho FlexibleColumnLayout
    const uiModel = new JSONModel();
    this.setModel(uiModel, "ui");

    this.router = this.getRouter();
    this.router.attachBeforeRouteMatched(this.onBeforeRouteMatched.bind(this), this);

    // set the device model
    this.setModel(createDeviceModel(), "device");

    // enable routing
    this.getRouter().initialize();
  }

  private loadWorkflow(): void {
    const oModel = <ODataModel>this.getModel();
    const workflowModel = <JSONModel>this.getModel("workflow");

    oModel.read("/StepListSet", {
      urlParameters: {
        $expand: "ToSubstepList/ToTaskList",
      },
      success: (response: ODataReadResult<ODataStep>) => {
        console.log("Workflow data loaded successfully.", response);

        const steps = response.results.map((step) => ({
          ...step,
          ToSubstepList: step.ToSubstepList?.results ?? [],
        }));

        workflowModel.setProperty("/steps", steps);

        const firstStep = steps[0];
        const firstSubstep = firstStep?.ToSubstepList?.[0];

        if (firstStep && firstSubstep) {
          this.getRouter().navTo(
            "detail",
            {
              step: firstStep.Step,
              substep: firstSubstep.Substep,
              layout: LayoutType.TwoColumnsMidExpanded,
            },
            true
          );
        }
      },

      error: (error: ODataError) => {
        console.error("OData read error:", error);
      },
    });
  }

  // Initialize the application asynchronously
  // It makes the application a lot faster and, through that, better to use.
  public override createContent(): Control | Promise<Control | null> | null {
    const appView = View.create({
      viewName: `${this.getAppID()}.view.App`,
      type: "XML",
      viewData: { component: this },
    });

    appView
      .then((view) => {
        view.addStyleClass(this.getContentDensityClass());
      })
      .catch((error) => {
        console.log(error);
      });

    return appView;
  }

  public getAppID() {
    return <string>this.getManifestEntry("/sap.app/id");
  }

  public getMessageManager() {
    return this.MessageManager;
  }

  public getContentDensityClass(): string {
    return Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
  }

  public getStartupParameters() {
    if (!this.getComponentData()) {
      return {};
    }

    const parameters = (<ComponentData>this.getComponentData()).startupParameters;

    const values = Object.keys(parameters).reduce<Dict>((acc, key) => {
      acc[key] = parameters[key][0];
      return acc;
    }, {});

    return values;
  }

  private onBeforeRouteMatched(event: Router$BeforeRouteMatchedEvent): void {
    const model = <JSONModel>this.getModel("ui");

    if (!model) {
      return;
    }

    const argument = <{ layout?: LayoutType } | undefined>event.getParameter("arguments");

    let layout: LayoutType | undefined = argument?.layout;

    if (!layout) {
      layout = LayoutType.OneColumn;
    }

    model.setProperty("/layout", layout);
  }

  public getFCLHelper() {
    const fcl = <FlexibleColumnLayout>(<View>this.getRootControl()).byId("fcl");

    return FlexibleColumnLayoutSemanticHelper.getInstanceFor(fcl, {
      defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
      defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
      maxColumnsCount: 2,
    });
  }
}
