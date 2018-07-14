import React from 'react';
import { FormField } from 'react-form';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

const FabricDropdown = ({
  fieldApi: { getValue, setValue },
  onInput,
  ...rest
}) => (
  <Dropdown
    defaultSelectedKey={getValue()}
    onChanged={value => {
      setValue(value.key);
    }}
    {...rest}
  />
);

export default FormField(FabricDropdown);
