export const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "32px",
    height: "32px",
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    borderColor: state.isFocused ? "#a5b4fc" : "#d1d5db",
    ":hover": {
      borderColor: "#9ca3af",
    },
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    height: "32px",
    padding: "0 6px",
  }),
  input: (provided: any) => ({
    ...provided,
    margin: "0px",
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    height: "32px",
  }),
};
