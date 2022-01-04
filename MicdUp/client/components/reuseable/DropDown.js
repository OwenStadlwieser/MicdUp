import React, { Component } from "react";
import { connect } from "react-redux";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import onClickOutside from "react-onclickoutside";
import { styles } from "../../styles/Styles";
export class DropDown extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  handleClickOutside = (evt) => {
    this.props.onBlur();
  };
  render() {
    const { searchTerm, results } = this.props;

    return (
      <ScrollView style={styles.resultsContainer}>
        {results &&
          results.map((res, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                this.props.onPressFunc(res);
              }}
              style={styles.listItemContainer}
            >
              <Text style={styles.listItemText}>{res.title}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(onClickOutside(DropDown));
