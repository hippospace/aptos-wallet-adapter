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

export const timeoutPromise = (timeout) => {
  let timeoutId;
  const promise: Promise<void> = new Promise((resolve, reject) => {
    timeoutId = setTimeout(async () => {
      reject('timeout');
    }, timeout);
  });
  return {
    timeoutId,
    promise
  };
};
