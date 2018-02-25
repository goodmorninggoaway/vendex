import React from 'react';
import { FormField } from 'react-form';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

const FabricToggleField = ({
  fieldApi: { getValue, setValue },
  onInput,
  ...rest
}) => <Toggle checked={getValue()} onChanged={setValue} {...rest} />;

export default FormField(FabricToggleField);
