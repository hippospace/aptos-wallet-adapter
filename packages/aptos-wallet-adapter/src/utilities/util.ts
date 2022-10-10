import { Types } from 'aptos';

export const payloadV1ToV0 = (payload: Types.TransactionPayload) => {
  const v1 = payload as Types.TransactionPayload_EntryFunctionPayload;
  return {
    type: 'script_function_payload',
    function: v1.function,
    type_arguments: v1.type_arguments,
    arguments: v1.arguments
  };
};
