import Router from "sap/ui/core/routing/Router";
import JSONModel from "sap/ui/model/json/JSONModel";
import Base from "./Base.controller";
import type { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import type { RouteArguments, Step, TaskList } from "../types/pages/main";
import type Button from "sap/m/Button";
import type DatePicker from "sap/m/DatePicker";
import type TimePicker from "sap/m/TimePicker";
import type MultiComboBox from "sap/m/MultiComboBox";
import type MultiInput from "sap/m/MultiInput";
import type TextArea from "sap/m/TextArea";
import type Input from "sap/m/Input";
import type FilterBar from "sap/ui/comp/filterbar/FilterBar";
import type Select from "sap/m/Select";
import type ComboBox from "sap/m/ComboBox";
import type CheckBox from "sap/m/CheckBox";
import type Switch from "sap/m/Switch";
import type { Dict } from "../types/utils";
import type Table from "sap/ui/table/Table";
import type DynamicPage from "sap/f/DynamicPage";
import type ListBinding from "sap/ui/model/ListBinding";
import type ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type { ODataError, ODataResponses } from "../types/odata";

/**
 * @namespace com.sphinxjsc.shopping1.controller
 */

export default class Detail extends Base {
  private router: Router;
  private model: JSONModel;
  private searchButton: Button;
  private clearButton: Button;
  private filterButton: Button;
  private layout: DynamicPage;

  //Filter
  private filterBar: FilterBar;

  private table: Table;

  public override onInit(): void {
    this.router = this.getRouter();
    this.model = this.getModel();
    this.table = this.getControlById<Table>("table");
    this.layout = this.getControlById<DynamicPage>("dynamicPage");

    this.setModel(
      new JSONModel({
        rows: [],
      }),
      "table"
    );

    this.setModel(
      new JSONModel({
        name: "",
      }),
      "header"
    );

    this.formatfiler();

    //filter
    this.filterBar = this.getControlById("filterBar");

    this.router.getRoute("detail")?.attachPatternMatched(this.onRouteMatched.bind(this), this);
  }

  private onRouteMatched(event: Route$MatchedEvent): void {
    const args = <RouteArguments>event.getParameter("arguments");

    this.setHeaderTitleFromWorkflow(args.step, args.substep);
    this.loadTasks(args.step, args.substep);
  }

  // #region Filters

  public onFilterChange() {
    this.onSearch();
    this.updateLabelsAndTable();
  }

  private updateLabelsAndTable() {
    this.table.setShowOverlay(true);
  }

  public getFilters() {
    const filters = this.filterBar.getFilterGroupItems().reduce<Dict>((acc, item) => {
      const control = item.getControl();
      const name = item.getName();

      switch (true) {
        case this.isControl<Input>(control, "sap.m.Input"):
        case this.isControl<TextArea>(control, "sap.m.TextArea"): {
          const value = control.getValue();

          if (value) {
            acc[name] = value;
          }

          break;
        }
        case this.isControl<DatePicker>(control, "sap.m.DatePicker"):
        case this.isControl<TimePicker>(control, "sap.m.TimePicker"): {
          const value = control.getValue();

          if (value) {
            acc[name] = value;
          }

          break;
        }
        case this.isControl<Select>(control, "sap.m.Select"):
        case this.isControl<ComboBox>(control, "sap.m.ComboBox"): {
          const value = control.getSelectedKey();

          if (value) {
            acc[name] = value;
          }

          break;
        }
        default:
          break;
      }

      return acc;
    }, {});
    return filters;
  }
  // #endregion Filters

  // tìm kiếm
  public onSearch() {
    const filters: Filter[] = [];

    const subject = this.getControlById<Input>("Subject");
    const from = this.getControlById<Select>("from");
    const priority = this.getControlById<Select>("priority");
    const status = this.getControlById<Select>("filterStatus");
    const forwarded = this.getControlById<Select>("forwwarded");
    const sentOn = this.getControlById<DatePicker>("datePicker");
    const dueDate = this.getControlById<DatePicker>("datePicker2");

    const subjectValue = subject?.getValue();
    const fromKey = from?.getSelectedKey();
    const priorityKey = priority?.getSelectedKey();
    const statusKey = status?.getSelectedKey();
    const forwardedKey = forwarded?.getSelectedKey();
    const sentOnValue = sentOn?.getValue();
    const dueDateValue = dueDate?.getValue();

    if (subjectValue) {
      filters.push(new Filter("Task", FilterOperator.Contains, subjectValue));
    }

    if (fromKey) {
      filters.push(new Filter("WiForwBy", FilterOperator.EQ, fromKey));
    }

    if (priorityKey) {
      filters.push(new Filter("WiPrio", FilterOperator.EQ, priorityKey));
    }

    if (statusKey) {
      filters.push(new Filter("Status", FilterOperator.EQ, statusKey));
    }

    if (forwardedKey) {
      filters.push(new Filter("WiForwBy", FilterOperator.EQ, forwardedKey));
    }

    if (sentOnValue) {
      filters.push(new Filter("WiCd", FilterOperator.EQ, sentOnValue));
    }

    if (dueDateValue) {
      filters.push(new Filter("WiAed", FilterOperator.EQ, dueDateValue));
    }

    const binding = <ListBinding>this.table.getBinding("rows");
    binding?.filter(filters);
  }

  public onClear(): void {
    this.filterBar.getFilterGroupItems().forEach((item) => {
      const control = item.getControl();

      if (!control) return;

      switch (true) {
        case this.isControl<Input>(control, "sap.m.Input"):
        case this.isControl<TextArea>(control, "sap.m.TextArea"):
        case this.isControl<DatePicker>(control, "sap.m.DatePicker"):
        case this.isControl<TimePicker>(control, "sap.m.TimePicker"):
          control.setValue("");
          break;

        case this.isControl<Select>(control, "sap.m.Select"):
        case this.isControl<ComboBox>(control, "sap.m.ComboBox"):
          control.setSelectedKey("");
          break;

        case this.isControl<MultiInput>(control, "sap.m.MultiInput"):
          control.removeAllTokens();
          break;

        case this.isControl<MultiComboBox>(control, "sap.m.MultiComboBox"):
          control.setSelectedKeys([]);
          break;

        case this.isControl<CheckBox>(control, "sap.m.CheckBox"):
          control.setSelected(false);
          break;

        case this.isControl<Switch>(control, "sap.m.Switch"):
          control.setState(false);
          break;
      }
    });

    // clear table filter
    const binding = <ListBinding>this.table.getBinding("rows");
    binding?.filter([]);

    this.table.setShowOverlay(false);
  }

  private setHeaderTitleFromWorkflow(step: string, substep: string): void {
    const workflowModel = this.getModel("workflow");
    const headerModel = this.getModel("header");

    if (!workflowModel) {
      return;
    }

    const steps = <Step[]>workflowModel.getProperty("/steps");
    if (!Array.isArray(steps)) return;

    const stepNode = steps.find((s) => s.Step === step);
    if (!stepNode) return;

    const subNode = stepNode.ToSubstepList?.find((ss) => ss.Substep === substep);
    const titleText = subNode?.SubstepDescr;

    headerModel.setProperty("/name", titleText);
  }

  private loadTasks(step: string, substep: string): void {
    const oDataModel = this.getModel<ODataModel>();
    const tabeModel = this.getModel<JSONModel>("table");

    const filters: Filter[] = [
      new Filter("Step", FilterOperator.EQ, step),
      new Filter("Substep", FilterOperator.EQ, substep),
    ];
    oDataModel.read("/TaskListSet", {
      filters,
      success: (response: ODataResponses<TaskList>) => {
        console.log("OData read success:", response.results);

        tabeModel.setProperty("/rows", response.results);
      },
      error: (error: ODataError) => {
        console.error("OData read error:", error);
      },
    });
  }

  public onRefresh(): void {
    const binding = this.table.getBinding("rows");
    binding?.refresh?.();
  }

  // #region Formatters
  public statusText(Status: string) {
    const mStatus: Record<string, string> = {
      WAITING: "Waiting",
      READY: "Ready",
      SELECTED: "Accepted",
      STARTED: "In Process",
      ERROR: "Error",
      COMMITTED: "Executed",
      COMPLETED: "Completed",
      CANCELLED: "Logically Deleted",
      CHECKED: "In Preparation",
      EXPCAUGHT: "Exception Caught",
      EXPHANDLR: "Exception Active",
    };
    return mStatus[Status] || Status;
  }

  public statusState(Status: string) {
    switch (Status) {
      case "READY":
      case "COMMITTED":
      case "COMPLETED":
        return "Success";
      case "STARTED":
      case "CHECKED":
        return "Information";
      case "WAITING":
      case "SELECTED":
        return "None";
      case "ERROR":
      case "EXPCAUGHT":
      case "EXPHANDLR":
        return "Error";
      case "CANCELLED":
        return "Warning";
      default:
        return "None";
    }
  }

  public priorityText(Priority: string) {
    const mPriority: Record<string, string> = {
      "1": "Highest - Express",
      "2": "Very high",
      "3": "Higher",
      "4": "High",
      "5": "Medium",
      "6": "Low",
      "7": "Lower",
      "8": "Very low",
      "9": "Lowest",
    };
    return mPriority[Priority] || Priority;
  }

  public priorityState(Priority: string) {
    const Prio = parseInt(Priority, 2);
    if (Prio <= 3) return "Error";
    if (Prio <= 5) return "Warning";
    if (Prio <= 9) return "Success";
    return "None";
  }
  // #endregion Formatters

  private formatfiler() {
    const searchButtonId = this.byId("filterBar")?.getId() + "-btnGo";
    this.searchButton = this.getControlById(searchButtonId);
    this.searchButton.setText("Search");
    this.searchButton.setIcon("sap-icon://search");

    const clearButtonId = this.byId("filterBar")?.getId() + "-btnClear";
    this.clearButton = this.getControlById(clearButtonId);
    this.clearButton.setText("Clear Filters");

    const filtersButtonId = this.byId("filterBar")?.getId() + "-btnFilters";
    this.filterButton = this.getControlById(filtersButtonId);
    this.filterButton.setIcon("sap-icon://filter-facets");
  }
}
