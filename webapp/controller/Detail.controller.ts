import Router from "sap/ui/core/routing/Router";
import JSONModel from "sap/ui/model/json/JSONModel";
import Base from "./Base.controller";
import type { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import type ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type { ODataError, ODataReadResult } from "../types/odata";
import type { Task } from "../types/pages/main";
import type Button from "sap/m/Button";
import type { FilterBar$FilterChangeEvent } from "sap/ui/comp/filterbar/FilterBar";
import type { FilterPayload } from "../types/filter";
import type DatePicker from "sap/m/DatePicker";
import type TimePicker from "sap/m/TimePicker";
import type MultiComboBox from "sap/m/MultiComboBox";
import type MultiInput from "sap/m/MultiInput";
import type TextArea from "sap/m/TextArea";
import type Input from "sap/m/Input";
import type FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";
import type SmartVariantManagement from "sap/ui/comp/smartvariants/SmartVariantManagement";
import type FilterBar from "sap/ui/comp/filterbar/FilterBar";
import type Select from "sap/m/Select";
import type ComboBox from "sap/m/ComboBox";
import type CheckBox from "sap/m/CheckBox";
import type Switch from "sap/m/Switch";
import type { Dict } from "../types/utils";
import type Table from "sap/ui/table/Table";
import Token from "sap/m/Token";
import type DynamicPage from "sap/f/DynamicPage";
import PersonalizableInfo from "sap/ui/comp/smartvariants/PersonalizableInfo";
import { noop } from "../utils/shared";

/**
 * @namespace com.sphinxjsc.shopping1.controller
 */

export default class Detail extends Base {
  private router: Router;
  private model: JSONModel;
  private focusFullScreenButton: boolean = false;
  private product: string = "0";
  private searchButton: Button;
  private clearButton: Button;
  private filterButton: Button;
  private layout: DynamicPage;

  //Filter
  private svm: SmartVariantManagement;
  private filterBar: FilterBar;

  private table: Table;

  public override onInit(): void {
    this.router = this.getRouter();
    this.model = this.getModel();
    this.table = this.getControlById<Table>("table");
    this.layout = this.getControlById<DynamicPage>("dynamicPage");

    this.formatfiler();

    //filter
    this.svm = this.getControlById<SmartVariantManagement>("svm");
    this.filterBar = this.getControlById("filterBar");

    //filter initialize
    this.filterBar.registerFetchData(this.fetchData);
    this.filterBar.registerApplyData(this.applyData);
    this.filterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

    this.router.getRoute("detail")?.attachPatternMatched(this.onRouteMatched.bind(this), this);
  }

  private onRouteMatched(event: Route$MatchedEvent): void {
    const args = event.getParameter("arguments") as {
      step: string;
      substep: string;
    };

    this.setHeaderTitleFromWorkflow(args.step, args.substep);
    this.loadTasksFromCache(args.step, args.substep);
  }

  // #region Filters
  /**
   * Lấy các trường giá trị để tạo biến thể bộ lọc mới
   */
  private fetchData = () => {
    return this.filterBar.getAllFilterItems(false).reduce<FilterPayload[]>((acc, item: FilterGroupItem) => {
      const control = item.getControl();
      const groupName = item.getGroupName();
      const fieldName = item.getName();
      if (control) {
        let fieldData: string | string[] = "";

        switch (true) {
          case this.isControl<Input>(control, "sap.m.Input"): {
            fieldData = control.getValue();
            break;
          }

          case this.isControl<TextArea>(control, "sap.m.TextArea"): {
            fieldData = control.getValue();
            break;
          }

          case this.isControl<MultiInput>(control, "sap.m.MultiInput"): {
            fieldData = control.getTokens().map((token) => token.getKey());
            break;
          }

          case this.isControl<DatePicker>(control, "sap.m.DatePicker"): {
            fieldData = control.getValue();
            break;
          }

          case this.isControl<TimePicker>(control, "sap.m.TimePicker"): {
            fieldData = control.getValue();
            break;
          }

          case this.isControl<MultiComboBox>(control, "sap.m.MultiComboBox"): {
            fieldData = control.getSelectedKeys();
            break;
          }

          case this.isControl<Select>(control, "sap.m.Select"): {
            fieldData = control.getSelectedKey();
            break;
          }

          case this.isControl<ComboBox>(control, "sap.m.ComboBox"): {
            fieldData = control.getSelectedKey();
            break;
          }

          case this.isControl<CheckBox>(control, "sap.m.CheckBox"): {
            fieldData = control.getSelected().toString();
            break;
          }

          case this.isControl<Switch>(control, "sap.m.Switch"): {
            fieldData = control.getState().toString();
            break;
          }
          default:
            break;
        }
        acc.push({
          groupName,
          fieldName,
          fieldData,
        });
      }

      return acc;
    }, []);
  };

  /**
   * Áp dụng các trường giá trị từ biến thể bộ lọc
   */
  private applyData = (data: unknown) => {
    (<FilterPayload[]>data).forEach((item) => {
      const { groupName, fieldName, fieldData } = item;
      const control = this.filterBar.determineControlByName(fieldName, groupName);

      switch (true) {
        case this.isControl<Input>(control, "sap.m.Input"): {
          control.setValue(<string>fieldData);
          break;
        }

        case this.isControl<TextArea>(control, "sap.m.TextArea"): {
          control.setValue(<string>fieldData);
          break;
        }

        case this.isControl<MultiInput>(control, "sap.m.MultiInput"): {
          const tokens = (<string[]>fieldData).map((key) => new Token({ key, text: key }));
          control.setTokens(tokens);
          break;
        }

        case this.isControl<DatePicker>(control, "sap.m.DatePicker"): {
          control.setValue(<string>fieldData);
          break;
        }

        case this.isControl<TimePicker>(control, "sap.m.TimePicker"): {
          control.setValue(<string>fieldData);
          break;
        }

        case this.isControl<MultiComboBox>(control, "sap.m.MultiComboBox"): {
          control.setSelectedKeys(<string[]>fieldData);
          break;
        }

        case this.isControl<Select>(control, "sap.m.Select"): {
          control.setSelectedKey(<string>fieldData);
          break;
        }

        case this.isControl<ComboBox>(control, "sap.m.ComboBox"): {
          control.setSelectedKey(<string>fieldData);
          break;
        }

        case this.isControl<CheckBox>(control, "sap.m.CheckBox"): {
          control.setSelected();
          break;
        }

        case this.isControl<Switch>(control, "sap.m.Switch"): {
          control.setState();
          break;
        }
        default:
          break;
      }
    });
  };

  //Lấy các bộ lọc có giá trị để hiển thị trên nhãn
  private getFiltersWithValues = () => {
    return this.filterBar.getFilterGroupItems().reduce<FilterGroupItem[]>((acc, item) => {
      const control = item.getControl();

      if (control) {
        switch (true) {
          case this.isControl<Input>(control, "sap.m.Input"): {
            const value = control.getValue();
            if (value) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<TextArea>(control, "sap.m.TextArea"): {
            const value = control.getValue();
            if (value) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<MultiInput>(control, "sap.m.MultiInput"): {
            const tokens = control.getTokens();

            if (tokens.length) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<DatePicker>(control, "sap.m.DatePicker"): {
            const value = control.getValue();

            if (value) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<TimePicker>(control, "sap.m.TimePicker"): {
            const value = control.getValue();

            if (value) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<MultiComboBox>(control, "sap.m.MultiComboBox"): {
            const keys = control.getSelectedKeys();
            if (keys.length) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<Select>(control, "sap.m.Select"): {
            const key = control.getSelectedKey();
            if (key) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<ComboBox>(control, "sap.m.ComboBox"): {
            const key = control.getSelectedKey();
            if (key) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<CheckBox>(control, "sap.m.CheckBox"): {
            const value = control.getSelected().toString();
            if (value) {
              acc.push(item);
            }
            break;
          }

          case this.isControl<Switch>(control, "sap.m.Switch"): {
            const value = control.getState().toString();
            if (value) {
              acc.push(item);
            }
            break;
          }
          default:
            break;
        }
      }

      return acc;
    }, []);
  };

  public onSelectionChange(event: FilterBar$FilterChangeEvent) {
    this.svm.currentVariantSetModified(true);
    this.filterBar.fireEvent("filterChange", event);
  }

  public onFilterChange() {
    this.updateLabelsAndTable();
  }

  public onAfterVariantLoad() {
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

  //tìm kiếm
  public onSearch() {
    const oDataModel = this.getModel<ODataModel>();
    const tabeMoel = this.getModel<JSONModel>("table");

    this.table.setBusy(true);

    this.table.setShowOverlay(false);
  }

  private setHeaderTitleFromWorkflow(step: string, substep: string): void {
    const workflowModel = this.getOwnerComponent()?.getModel("workflow") as JSONModel;

    if (!workflowModel) {
      console.warn("workflow model chưa sẵn sàng");
      return;
    }

    const steps = workflowModel.getProperty("/steps");
    if (!Array.isArray(steps)) return;

    const stepNode = steps.find((s: any) => s.Step === step);
    if (!stepNode) return;

    const subNode = stepNode.ToSubstepList?.find((ss: any) => ss.Substep === substep);
    const titleText = subNode?.SubstepDescr;

    this.getView()?.setModel(new JSONModel({ name: titleText }), "header");
  }

  private loadTasksFromCache(step: string, substep: string): void {
    const workflowModel = this.getModel<JSONModel>("workflow");

    if (!workflowModel) {
      console.warn("workflow model chưa sẵn sàng");
      return;
    }

    const steps = workflowModel.getProperty("/steps");
    if (!Array.isArray(steps)) {
      console.warn("steps chưa load xong");
      return;
    }

    const stepNode = steps.find((s: any) => s.Step === step);
    if (!stepNode) return;

    const subNode = stepNode.ToSubstepList?.find((ss: any) => ss.Substep === substep);
    if (!subNode) return;

    const tasks = subNode.ToTaskList?.results || [];

    this.getView()?.setModel(new JSONModel({ ProductCollection: tasks }), "detail");

    console.log("data detail item", this.getView()?.getModel("detail")?.getProperty("/ProductCollection"));
  }

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
