import React, { Component } from "react";
import { connect } from "react-redux";
import { View, TouchableOpacity, Image, Text, ScrollView } from "react-native";
// users
import { searchUsers } from "../../../redux/actions/user";
// components
import SearchComponent from "../../reuseable/SearchComponent";
// styles
import { styles } from "../../../styles/Styles";

export class Search extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      users: [],
      term: "",
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  setUsersState = (users) => {
    this.mounted && this.setState({ users });
  };

  setSearchTerm = (term) => {
    this.mounted && this.setState({ term });
  };
  render() {
    const { users, term } = this.state;
    return (
      <View style={styles.pane}>
        <SearchComponent
          parentViewStyle={styles.parentViewStyleUsers}
          searchInputContainerStyle={styles.searchInputContainerStyleUsers}
          inputStyle={styles.inputStyleUsers}
          isForUser={true}
          placeholder={"Search"}
          setStateOnChange={true}
          setStateOnChangeFunc={this.setSearchTerm.bind(this)}
          setResOnChange={true}
          setResOnChangeFunc={this.setUsersState.bind(this)}
          searchFunction={this.props.searchUsers}
          splitSearchTerm={true}
          inputStyle={styles.textInputRecEdit}
          placeHolderColor={"white"}
          scrollable={true}
          displayResults={false}
          initValue={users}
        />
        {term.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <View style={styles.tagResultsContainer}></View>
            <ScrollView style={styles.userResultsContainer}>
              {users &&
                users.length > 0 &&
                users.map((res, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      this.props.onPressFunc(res);
                    }}
                    style={styles.listItemContainerUser}
                  >
                    <Image
                      source={
                        res.profile && res.profile.image
                          ? {
                              uri: res.profile.image.signedUrl,
                            }
                          : require("../../../assets/no-profile-pic-icon-27.jpg")
                      }
                      style={styles.listItemProfileImg}
                    />
                    <Text style={styles.listItemTextUser}>{res.userName}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { searchUsers })(Search);
