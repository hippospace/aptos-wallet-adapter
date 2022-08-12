import { TransactionPayload, TransactionPayload_ScriptFunctionPayload } from 'aptos/dist/generated';

export const payloadV1ToV0 = (payload: TransactionPayload) => {
  const v1 = payload as TransactionPayload_ScriptFunctionPayload;
  return {
    type: 'script_function_payload',
    function: v1.function,
    type_arguments: v1.type_arguments,
    arguments: v1.arguments
  };
};
