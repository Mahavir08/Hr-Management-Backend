import mongoose, { Schema, Document } from "mongoose";
import {
  CitizenshipStatus,
  AgeGroup,
  SalaryDetails,
  CPFCalculationResult,
} from "../types/cpf.types";

export interface ICPFRecord extends Document {
  employeeId: string;
  citizenship: CitizenshipStatus;
  ageGroup: AgeGroup;
  salaryDetails: SalaryDetails;
  calculations: CPFCalculationResult;
  calculatedAt: Date;
}

const CPFRecordSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    index: true,
  },
  citizenship: {
    type: String,
    enum: ["CITIZEN", "FOREIGNER"],
    required: true,
  },
  ageGroup: {
    type: String,
    enum: ["BELOW_55", "55_TO_60", "60_TO_65", "65_TO_70", "ABOVE_70"],
    required: true,
  },
  salaryDetails: {
    basicSalary: {
      type: Number,
      required: true,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    additionalWages: {
      type: Number,
      default: 0,
    },
  },
  calculations: {
    employeeContribution: {
      type: Number,
      required: true,
    },
    employerContribution: {
      type: Number,
      required: true,
    },
    totalContribution: {
      type: Number,
      required: true,
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
  },
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for common queries
CPFRecordSchema.index({ calculatedAt: -1 });
CPFRecordSchema.index({ citizenship: 1, ageGroup: 1 });

export const CPFRecord = mongoose.model<ICPFRecord>(
  "CPFRecord",
  CPFRecordSchema
);
