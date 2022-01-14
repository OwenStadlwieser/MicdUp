import React, { Component } from "react";
import { connect } from "react-redux";
import { View, TouchableOpacity, Image, Text, ScrollView } from "react-native";
// users
import { searchUsers } from "../../../redux/actions/user";
import { searchTags } from "../../../redux/actions/tag";
import { getRecordingsFromTag } from "../../../redux/actions/recording";
import { viewProfile, searchViewProfile } from "../../../redux/actions/display";
// components
import SearchComponent from "../../reuseable/SearchComponent";
import Profile from "../Profile/Profile";
// styles
import { styles } from "../../../styles/Styles";

export class Search extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      users: [],
      tags: [],
      term: "",
      userName: "",
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  setUsersState = (users) => {
    this.mounted && this.setState({ users });
  };

  setTagsState = (tags) => {
    this.mounted && this.setState({ tags });
  };

  setSearchTerm = (term) => {
    this.mounted && this.setState({ term });
  };
  render() {
    const { users, term, userName, tags } = this.state;
    const { searchViewingProfile } = this.props;
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
          secondSearchFunction={this.props.searchTags}
          secondSearch={true}
          setSecondRes={this.setTagsState.bind(this)}
          splitSearchTerm={true}
          inputStyle={styles.textInputRecEdit}
          placeHolderColor={"white"}
          scrollable={true}
          displayResults={false}
          initValue={users}
        />
        {term.length > 0 && !searchViewingProfile ? (
          <View style={styles.searchResultsContainer}>
            <ScrollView style={styles.tagResultsContainer}>
              {tags &&
                tags.length > 0 &&
                tags.map((res, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={async () => {
                      await this.props.getRecordingsFromTag(res._id, 0);
                    }}
                    style={styles.listItemContainerUser}
                  >
                    <Text style={styles.listItemTextUser}>{res.title}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <ScrollView style={styles.userResultsContainer}>
              {users &&
                users.length > 0 &&
                users.map((res, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      this.mounted && this.setState({ userName: res.userName });
                      this.props.viewProfile(res.profile);
                      this.props.searchViewProfile(true);
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
        ) : (
          searchViewingProfile && <Profile userName={userName} />
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  searchViewingProfile: state.display.searchViewingProfile,
});

export default connect(mapStateToProps, {
  searchUsers,
  viewProfile,
  searchViewProfile,
  searchTags,
  getRecordingsFromTag,
})(Search);
