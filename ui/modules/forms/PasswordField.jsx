import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormField } from 'react-form';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

const validators = {
  charLength(value) {
    if (value && value.length >= 8) {
      return true;
    }
  },
  lowercase(value) {
    var regex = /^(?=.*[a-z]).+$/; // Lowercase character pattern

    if (value && regex.test(value)) {
      return true;
    }
  },
  uppercase(value) {
    var regex = /^(?=.*[A-Z]).+$/; // Uppercase character pattern

    if (regex.test(value)) {
      return true;
    }
  },
  special(value) {
    var regex = /^(?=.*[0-9_\W]).+$/; // Special character or number pattern

    if (regex.test(value)) {
      return true;
    }
  },
};

const FabricPasswordField = ({
  fieldApi: { getValue, setValue, getError },
  onInput,
  validate,
  ...rest
}) => {
  const validationResult = {
    charLength: validators.charLength(getValue()),
    lowercase: validators.lowercase(getValue()),
    uppercase: validators.uppercase(getValue()),
    special: validators.special(getValue()),
  };

  return (
    <Fragment>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .v-FabricPasswordField--validation {
          white-space: nowrap;
          list-style: none;
          padding: 0;
        }

        .v-FabricPasswordField--validation .ms-Icon {
          margin-right: 4px;
        }

        .v-FabricPasswordField--validation > .valid {
          color: #107c10;
        }
      `,
        }}
      />
      <TextField
        value={getValue()}
        onChanged={value => {
          setValue(value);
          if (onInput) {
            onInput(value);
          }
        }}
        errorMessage={getError()}
        {...rest}
      />

      {validate && (
        <ul className="v-FabricPasswordField--validation">
          A good password...
          <li className={classnames({ valid: validationResult.charLength })}>
            <i
              className={classnames('ms-Icon ms-Icon--Accept', {
                'ms-fontColor-neutralTertiary': !validationResult.charLength,
              })}
              aria-hidden="true"
            />
            is at least 8 characters long,
          </li>
          <li className={classnames({ valid: validationResult.lowercase })}>
            <i
              className={classnames('ms-Icon ms-Icon--Accept', {
                'ms-fontColor-neutralTertiary': !validationResult.lowercase,
              })}
              aria-hidden="true"
            />
            contains a lowercase letter,
          </li>
          <li className={classnames({ valid: validationResult.uppercase })}>
            <i
              className={classnames('ms-Icon ms-Icon--Accept', {
                'ms-fontColor-neutralTertiary': !validationResult.uppercase,
              })}
              aria-hidden="true"
            />
            contains an uppercase letter,
          </li>
          <li className={classnames({ valid: validationResult.special })}>
            <i
              className={classnames('ms-Icon ms-Icon--Accept', {
                'ms-fontColor-neutralTertiary': !validationResult.special,
              })}
              aria-hidden="true"
            />
            and contains a number or special character (one of the keys that
            isn't a letter or number).
          </li>
        </ul>
      )}
    </Fragment>
  );
};

FabricPasswordField.propTypes = {
  validate: PropTypes.bool,
};

export default FormField(FabricPasswordField);
