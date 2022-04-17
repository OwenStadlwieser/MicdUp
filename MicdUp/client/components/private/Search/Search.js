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
import { viewProfile, searchViewProfile } from "../../../redux/actions/display";
// components
import SearchComponent from "../../reuseable/SearchComponent";
import Profile from "../Profile/Profile";
import Feed from "../Feed/Feed";
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

  componentDidMount = () => {
    const { currentProfile, searchViewingProfile } = this.props;
    if (searchViewingProfile && currentProfile.id) {
      this.mounted &&
        this.setState({
          id: currentProfile.id,
          userName: currentProfile.user.userName,
        });
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

  setSelectedTag = (tag) => {
    console.log(tag);
    this.mounted && this.setState({ searchExecuted: true, tag });
  };
  render() {
    const { users, term, userName, tags, searchExecuted, id, tag } = this.state;
    const { searchViewingProfile } = this.props;
    if (searchExecuted) {
      return <Feed key={"search"} fromSearch={true} tag={tag} />;
    }
    return (
      <View style={[styles.paneUncentered, { alignItems: "center" }]}>
        {!searchViewingProfile && (
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
            initValue={users ? users.toString() : ""}
          />
        )}
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
              <PopularTags setSelectedTag={this.setSelectedTag.bind(this)} />
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
              <RecommendedTags
                setSelectedTag={this.setSelectedTag.bind(this)}
              />
            </View>
          </View>
        )}
        {term.length > 0 && !searchViewingProfile ? (
          <View style={styles.searchResultsContainer}>
            <ScrollView style={styles.tagResultsContainer}>
              {tags &&
                tags.length > 0 &&
                tags.map((res, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={async () => {
                      this.setSelectedTag(res._id);
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
                      this.mounted &&
                        this.setState({
                          userName: res.userName,
                          id: res.profile.id,
                        });
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
          searchViewingProfile && (
            <Profile
              key={id}
              id={id}
              backArrow={true}
              backAction={(() => {
                this.props.searchViewProfile(false);
              }).bind(this)}
              userName={userName}
            />
          )
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  searchViewingProfile: state.display.searchViewingProfile,
  currentProfile: state.display.viewingProfile,
});

export default connect(mapStateToProps, {
  searchUsers,
  viewProfile,
  searchViewProfile,
  searchTags,
})(Search);
