import React from 'react';
import { FormField } from 'react-form';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

const FabricTextField = ({
  fieldApi: { getValue, setValue },
  onInput,
  ...rest
}) => (
  <TextField
    value={getValue()}
    onChanged={value => {
      setValue(value);
      if (onInput) {
        onInput(value);
      }
    }}
    {...rest}
  />
);

export default FormField(FabricTextField);
