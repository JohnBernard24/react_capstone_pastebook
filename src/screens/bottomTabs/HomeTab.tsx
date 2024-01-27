import { FlatList, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { UserAvatar } from "../../components/customComponents/UserAvatar";
import { Images } from "../../utils/Images";
import { IndividualPost } from "../../components/IndividualPost";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFriend } from "../../context/FriendContext";
import { Colors, Storage } from "../../utils/Config";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../../context/UserContext";
import { usePhoto } from "../../context/PhotoContext";
import BottomSheet from "@gorhom/bottom-sheet";
import { usePost } from "../../context/PostContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { IndividualComment } from "../../components/IndividualComment";

interface HomeTabProps {
    navigation: any;
    route: any;
}

export const HomeTab: React.FC<HomeTabProps> = ({ navigation, route }) => {
    const { getAllFriends } = useFriend();
    const { getProfile } = useUser();
    const { getPhotoById } = usePhoto();
    const { getNewsfeedPosts } = usePost();

    const [isScrollLoading, setIsScrollLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [profilePicture, setProfilePicture] = useState<any>();
    const [userId, setUserId] = useState('');

    const [friends, setFriends] = useState<any>([]);
    const [posts, setPosts] = useState<any>([]);

    useFocusEffect(() => {
        loadProfile();
    })

    useEffect(() => {
        getFriends();
        getPosts();
    }, []);

    const commentBottomSheetRef = useRef<BottomSheet>(null);
    const [isCommentBottomSheetVisible, setIsCommentBottomSheetVisible] = useState(false);
    const snapPoints = useMemo(() => ['45%', '90%'], []);
    const handleCommentSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            setIsCommentBottomSheetVisible(false);
        }
    }, []);

    const loadProfile = async () => {
        setUserId(Storage.getString('userId')!);

        if (userId != '') {
            const result = getProfile ? await getProfile(userId) : undefined;
            if (await result.id) {
                setFirstName(result.firstName);
                const pictureResult = getPhotoById ? await getPhotoById(result.photo.id) : undefined;

                if (pictureResult) {
                    setProfilePicture(pictureResult);
                }
            }
        }
    }

    //api functions
    const getFriends = async () => {
        try {
            const userId = Storage.getString('userId');

            if (userId) {
                const result = getAllFriends ? await getAllFriends(userId) : undefined;
                if (result) {
                    setFriends(result);
                }
            }
        } catch (error: any) {
            console.error("Error fetching photos:", error.response);
        }
    }
    const getPosts = async () => {
        try {
            const result = getNewsfeedPosts ? await getNewsfeedPosts() : undefined;
            console.log(result);
            if (result) {
                setPosts(result);
            }

        } catch (error: any) {
            console.error("Error fetching photos:", error.response);
        }
    }

    //scroll refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);
    const handleScroll = (event: { nativeEvent: { layoutMeasurement: any; contentOffset: any; contentSize: any; }; }) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && !isScrollLoading) {
            setIsScrollLoading(true);

            setTimeout(() => {
                // setFriends((prevFriends) => [...prevFriends, ...newData]);
                setIsScrollLoading(false);
            }, 1000);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <FlatList
                data={posts}
                onScroll={handleScroll}
                renderItem={({ item }) => <IndividualPost post={item} comments={754} likes={31321} onLikePress={() => { }} setIsBottomSheetVisible={setIsCommentBottomSheetVisible} navigation={undefined} route={undefined} />}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                ListHeaderComponent={
                    <TouchableWithoutFeedback onPress={() => commentBottomSheetRef.current && commentBottomSheetRef.current.close()}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', borderBottomColor: 'lightgray', borderBottomWidth: 1 }}>
                                <View style={{ marginStart: 15 }}>
                                    <UserAvatar item={{ id: userId, photo: { photoImageURL: profilePicture }, firstName: firstName }} navigation={navigation} route={route} />
                                </View>
                                <FlatList
                                    data={friends}
                                    scrollEnabled={friends.length > 4}
                                    renderItem={({ item }) => <UserAvatar item={item} navigation={navigation} route={route} />}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={[styles.friendsView]}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                }
            />

            <BottomSheet
                ref={commentBottomSheetRef}
                index={isCommentBottomSheetVisible ? 0 : -1}
                snapPoints={snapPoints}
                onChange={handleCommentSheetChanges}
                enablePanDownToClose
                style={{
                    borderTopStartRadius: 20,
                    borderTopEndRadius: 20,
                    shadowRadius: 20,
                    shadowColor: 'black',
                    elevation: 20,
                    zIndex: 1
                }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 0, borderBottomColor: 'gray', borderBottomWidth: 0.2, paddingTop: 20, paddingBottom: 10 }} >
                        <Text style={{ textAlign: "center", fontSize: 16, color: 'black', fontWeight: '500' }}>Comments</Text>
                    </View>

                    <View style={{ flex: 0, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                        <View style={[{ flexDirection: 'row', borderBottomColor: '#ccc', marginHorizontal: 10, marginVertical: 5, gap: 10, alignItems: "center", }]}>
                            <Image source={Images.sample_avatar} resizeMode="cover" style={{ aspectRatio: 1, width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: Colors.orange }} />

                            <TextInput
                                placeholder="Add a comment for jayvee.artemis ..."
                                style={{ fontFamily: 'Roboto-Medium', color: 'black', fontSize: 15, flex: 1, backgroundColor: 'transparent' }}
                                value={''}
                                onChangeText={() => { }}
                                placeholderTextColor={'#666'} />

                            <TouchableOpacity>
                                <MaterialCommunityIcons name="send" size={26} color={Colors.primaryBrand} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flex: 1, marginVertical: 20 }}>
                        <ScrollView>
                            <IndividualComment />
                        </ScrollView>
                    </View>
                </View>
            </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Roboto-Medium'
    },

    friendsView: {
        paddingHorizontal: 15,
        gap: 15,
        height: 85,
        marginBottom: 10,
    },
    postsContainer: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: "column",
        alignItems: 'center'
    }
})