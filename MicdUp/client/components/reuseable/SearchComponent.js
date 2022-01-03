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
    };
    this.nameInput = {};
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  search = debounce(async (searchTerm) => {
    if (searchTerm) {
      const res = await this.props.searchFunction(searchTerm);
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
    return (
      <View style={styles.parentViewStyle}>
        <View style={styles.searchInputContainer}>
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
            style={this.props.inputStyle}
            placeHolderColor={this.props.placeHolderColor}
            value={searchTerm}
          ></TextInput>
          {showDropDown && (
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
