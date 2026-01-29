import type { ODataReadResult } from "../odata";

export interface LeaveRequestItem {
  CreatedAt: Date;
  Reason: string;
  RequestId: string;
  CreatedBy: string;
  EmployeeId: string;
  LeaveType: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  TimeSlot: string;
}

export interface LeaveRequestForm {
  LeaveType: string;
  StartDate: string;
  EndDate: string;
  Reason: string;
  TimeSlot: string;
  TimeSlotIndex: number;
}

export interface FieldValueHelpItem {
  FieldKey: string;
  FieldName: string;
  FieldValue: string;
}

export interface RouteArguments {
  step: string;
  substep: string;
  layout: string;
}

export interface WorkflowNode {
  Step: string;
  Substep: string;
}

export interface ODataMetadata {
  id: string;
  uri: string;
  type: string;
}

export interface ODataTime {
  ms: number;
  __edmType: "Edm.Time";
}

export interface Task {
  TaskId: string;
  Step: string;
  Substep: string;
  TaskDescr: string;
  Status?: string;
  Magms: string;
  Mancc: string;
  Screen: string;
  Task: string;
  WiAed: string;
  WiCd: string;
  WiCt: string;
  WiForwBy: string;
  WiId: string;
  WiPrio: string;
  WiStat: string;
  WiText: string;
}

export interface TaskList {
  Step: string;
  Substep: string;
  Task: string;
  TaskDescr: string;
  WiId: string;
  WiText: string;
  WiPrio: string;
  WiStat: string;
  WiForwBy: string;
  WiAed: Date;
  WiCd: Date;
  WiCt: ODataTime;
  Magms: string;
  Mancc: string;
  Screen: string;
  __metadata: ODataMetadata;
}

export interface Substep {
  Step: string;
  Substep: string;
  SubstepDescr: string;
  ToTaskList?: Task[];
}

export interface Step {
  Step: string;
  StepDescr: string;
  ToSubstepList?: Substep[];
}

export interface ODataTask {
  TaskId: string;
  Substep: string;
  TaskDescr: string;
}

export interface ODataSubstep {
  Step: string;
  Substep: string;
  SubstepDescr: string;
  ToTaskList?: ODataReadResult<ODataTask>;
}

export interface ODataStep {
  Step: string;
  StepDescr: string;
  ToSubstepList?: ODataReadResult<ODataSubstep>;
}
