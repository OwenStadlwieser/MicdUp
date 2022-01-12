import React, { Component } from "react";
import { connect } from "react-redux";
import { View, TextInput } from "react-native";
import DropDown from "./DropDown";
// styles
import { styles } from "../../styles/Styles";
// helpers
import debounce from "lodash.debounce";

export class DropdownResults extends Component {
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

  search = debounce(async (searchTerm) => {
    const { scrollable, setResOnChangeFunc, setResOnChange } = this.props;
    const { skipMult } = this.state;
    if (searchTerm) {
      const res = scrollable
        ? await this.props.searchFunction(searchTerm, skipMult)
        : await this.props.searchFunction(searchTerm);
      if (setResOnChange) setResOnChangeFunc(res);
      this.mounted && this.setState({ results: res });
    }
  }, 300);

  onPressFunc = (res) => {
    const { searchTerm } = this.state;
    const pieces = searchTerm.split(/[\s,]+/);
    let newTerm = "";
    for (let i = 0; i < pieces.length - 1; i++) {
      newTerm.trim();
      newTerm = newTerm + " " + pieces[i];
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
    const { results, searchTerm, showDropDown } = this.state;
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
            }}
            placeholder={this.props.placeholder}
            onChangeText={(searchTerm) => {
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
              onPressFunc={this.onPressFunc.bind(this)}
              results={results}
              onBlur={this.onBlur.bind(this)}
            />
          )}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(DropdownResults);
