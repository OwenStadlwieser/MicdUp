import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { Title } from "react-native-paper";
// users
import { searchUsers } from "../../../redux/actions/user";
import { searchTags } from "../../../redux/actions/tag";
import {
  viewProfile,
  searchViewProfile,
  searchViewTag,
} from "../../../redux/actions/display";
// components
import SearchComponent from "../../reuseable/SearchComponent";
import PopularTags from "./PopularTags";
import RecommendedTags from "./RecommendedTags";

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
      searchExecuted: false,
      tag: null,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};
  componentDidUpdate = (prevProps) => {
    const { keyForSearch } = this.props;
    if (prevProps.keyForSearch != keyForSearch) {
      this.mounted && this.setState({ term: "" });
    }
  };
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
    const { users, term, tags } = this.state;
    return (
      <View
        key={this.props.route.params.key}
        style={[styles.paneUncentered, { alignItems: "center" }]}
      >
        <SearchComponent
          parentViewStyle={{ zIndex: 2 }}
          searchInputContainerStyle={styles.searchInputContainerStyleUsers}
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
          initValue={""}
        />
        {term.length == 0 && (
          <View style={styles.searchTags}>
            <View>
              <Title
                style={{
                  alignSelf: "baseline",
                  paddingLeft: 15,
                  fontStyle: "italic",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                Popular Topics
              </Title>
              <PopularTags setSelectedTag={this.props.searchViewTag} />
            </View>
            <View>
              <Title
                style={{
                  alignSelf: "baseline",
                  paddingLeft: 15,
                  fontStyle: "italic",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                Recommmended Topics
              </Title>
              <RecommendedTags setSelectedTag={this.props.searchViewTag} />
            </View>
          </View>
        )}
        {term.length > 0 && (
          <View style={styles.searchResultsContainer}>
            {users && users.length > 0 && (
              <ScrollView style={styles.userResultsContainer}>
                {users.map((res, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      this.props.viewProfile({
                        ...res.profile,
                        user: { userName: res.userName },
                      });
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
            )}
            {tags && tags.length > 0 && (
              <ScrollView style={styles.tagResultsContainer}>
                {tags.map((res, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={async () => {
                      this.props.searchViewTag(res);
                    }}
                    style={styles.listItemContainerUser}
                  >
                    <Text style={styles.listItemTextUser}>{res.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  currentProfile: state.display.viewingProfile,
  keyForSearch: state.display.keyForSearch,
});

export default connect(mapStateToProps, {
  searchUsers,
  viewProfile,
  searchViewProfile,
  searchTags,
  searchViewTag,
})(Search);
