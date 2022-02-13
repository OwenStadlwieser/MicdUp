import React, { Component } from "react";
import { connect } from "react-redux";
import { View, TextInput, Dimensions } from "react-native";
import DropDown from "./DropDown";
// styles
import { styles } from "../../styles/Styles";
// helpers
import debounce from "lodash.debounce";
const { height, width } = Dimensions.get("window");
export class SearchComponent extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      results: [],
      searchTerm: "",
      showDropDown: true,
      skipMult: 0,
    };
    this.nameInput = {};
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {
    this.mounted && this.setState({ searchTerm: this.props.initValue });
  };

  componentDidUpdate = (prevProps, prevState) => {
    const { inputTerm } = this.props;
    if (inputTerm !== prevProps.inputTerm) {
      this.mounted && this.setState({ searchTerm: inputTerm });
    }
  };
  search = debounce(async (searchTerm) => {
    const {
      scrollable,
      setResOnChangeFunc,
      setResOnChange,
      secondSearch,
      secondSearchFunction,
      setSecondRes,
    } = this.props;
    const { skipMult } = this.state;
    if (searchTerm) {
      const res = scrollable
        ? await this.props.searchFunction(searchTerm, skipMult)
        : await this.props.searchFunction(searchTerm);
      if (setResOnChange) setResOnChangeFunc(res);
      if (secondSearch) {
        const res = await secondSearchFunction(searchTerm);
        if (setResOnChange) setSecondRes(res);
      }

      this.mounted && this.setState({ results: res });
    }
  }, 300);

  onPressFunc = (res) => {
    let searchTerm;
    const { inputTerm } = this.props;
    if (!inputTerm) searchTerm = this.state.searchTerm;
    else searchTerm = inputTerm;
    const pieces = searchTerm.split(/[\s,]+/);
    let newTerm = "";
    for (let i = 0; i < pieces.length - 1; i++) {
      newTerm.trim();
      newTerm = i !== 0 ? newTerm + " " + pieces[i] : pieces[i];
    }
    if (newTerm) newTerm = newTerm + " ";
    this.mounted && this.setState({ searchTerm: newTerm + res.title + " " });
    if (this.props.setStateOnChange) {
      this.props.setStateOnChangeFunc(newTerm + res.title + " ");
    }
    this.nameInput && this.nameInput.focus();
  };

  onBlur = () => {
    this.mounted && this.setState({ showDropDown: false });
  };

  render() {
    let searchTerm;
    const { inputTerm } = this.props;
    if (!inputTerm) searchTerm = this.state.searchTerm;
    else searchTerm = inputTerm;
    const { results, showDropDown } = this.state;
    const {
      isForUser,
      parentViewStyle,
      searchInputContainerStyle,
      inputStyle,
      displayResults,
    } = this.props;
    return (
      <View style={parentViewStyle}>
        <View style={searchInputContainerStyle}>
          <TextInput
            ref={(input) => {
              this.nameInput = input;
            }}
            onFocus={() => {
              this.mounted && this.setState({ showDropDown: true });
              if (this.props.onFocus) {
                this.props.onFocus();
              }
            }}
            placeholder={this.props.placeholder}
            onChangeText={(searchTerm) => {
              if (this.props.onFocus) {
                this.props.onFocus();
              }
              if (this.props.setStateOnChange) {
                this.props.setStateOnChangeFunc(searchTerm);
              }
              this.mounted && this.setState({ searchTerm });
              if (this.props.splitSearchTerm) {
                const pieces = searchTerm.split(/[\s,]+/);
                const last = pieces[pieces.length - 1];
                this.search(last);
              }
            }}
            style={inputStyle}
            placeholderTextColor={this.props.placeHolderColor}
            placeHolderColor={this.props.placeHolderColor}
            value={searchTerm}
          ></TextInput>
          {showDropDown && displayResults && (
            <DropDown
              parentStyle={{
                width,
                height,
                position: "absolute",
                top: 0,
                left: 0,
                alignItems: "center",
              }}
              onPressFunc={this.onPressFunc.bind(this)}
              results={results}
              title={"title"}
              onBlur={this.onBlur.bind(this)}
              style={styles.resultsContainer}
            />
          )}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(SearchComponent);
