import { describe, expect, it } from "vitest";
import {
  type Err,
  type Ok,
  asyncThrowableToResult,
  isErrorResult,
  throwableToResult,
} from "./utils.js";
describe("throwableToResult", () => {
  it("should be return error result object, if produce function throw exeption.", () => {
    const comparison: Err = { error: new Error("error") };

    const result = throwableToResult(() => {
      throw comparison.error;
    });

    expect(result).toEqual(comparison);
    expect(isErrorResult(result)).toEqual(true);
  });

  it("shuld be return ok result object, if produce funtion not throw exeption.", () => {
    const comparison: Ok = { value: "test" };

    const result = throwableToResult(() => {
      return comparison.value;
    });

    expect(result).toEqual(comparison);
    expect(isErrorResult(result)).toEqual(false);
  });
});

describe("asyncThrowableToResult", () => {
  it("should be return error result object, if produce function throw exeption.", async () => {
    const comparison: Err = { error: new Error("error") };

    const result = await asyncThrowableToResult(async () => {
      throw comparison.error;
    });

    expect(result).toEqual(comparison);
    expect(isErrorResult(result)).toEqual(true);
  });

  it("shuld be return ok result object, if produce funtion not throw exeption.", async () => {
    const comparison: Ok = { value: "test" };

    const result = await asyncThrowableToResult(async () => {
      return comparison.value;
    });

    expect(result).toEqual(comparison);
    expect(isErrorResult(result)).toEqual(false);
  });
});

describe("isErrorResult", () => {
  it("should return true, if an object with an `error` property is received", () => {
    expect(isErrorResult({ error: "error" })).toBe(true);
    expect(isErrorResult({ error: new Error("error") })).toBe(true);
  });

  it("should return false, if an object without an `error` property is received", () => {
    expect(isErrorResult({ value: "a" })).toBe(false);
    expect(isErrorResult({ value: new Error("ok") })).toBe(false);
  });
});
