import { Entypo } from "@expo/vector-icons";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Dialog,
  TextArea,
  View,
  XStack
} from "tamagui";
import { addToInMemoryUserComment } from "../../Redux/authUserReducer";
import { ReduxStoreInterface } from "../../Redux/store";

const CommentDialog: React.FC<{
  originalItemId: number;
  originalItemContent: string;
  originalAuthor: string;
}> = ({ originalItemId, originalItemContent, originalAuthor }) => {
  const toast = useToast();
  const isLoggedIn = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userLoggedIn
  );
  const username = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userName
  );
  const [commentBody, setCommentBody] = useState<undefined | string>(undefined);
  const dispatch = useDispatch();

  return (
    <Dialog modal>
      <Dialog.Trigger asChild>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: "#f5f5f7",
            borderWidth: 1,
            borderColor: "#d1d1d6",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 32,
          }}
        >
          <Entypo name="reply" size={12} color="#007aff" />
        </View>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content
          bordered
          elevate
          gap="$4"
        >
          <Dialog.Title>Reply to Comment</Dialog.Title>
          <Dialog.Description>
            Reply to {originalAuthor}'s comment.
          </Dialog.Description>

          <TextArea
            placeholder="Write your reply..."
            value={commentBody}
            onChangeText={(text) => setCommentBody(text)}
            minHeight={100}
          />

          <XStack alignSelf="flex-end" gap="$4">
            <Dialog.Close displayWhenAdapted asChild>
              <Button theme="active" aria-label="Close">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close displayWhenAdapted asChild>
              <Button
                theme="active"
                aria-label="Submit"
                onPress={async () => {
                  if (!commentBody || commentBody.trim() === "") {
                    toast.show({
                      placement: "top",
                      render: ({ id }) => {
                        const toastId = "toast-" + id;
                        return (
                          <Toast
                            nativeID={toastId}
                            action="attention"
                            variant="solid"
                          >
                            <VStack space="xs">
                              <ToastTitle>🚨 Empty Comment</ToastTitle>
                              <ToastDescription>
                                Please write a comment before submitting
                              </ToastDescription>
                            </VStack>
                          </Toast>
                        );
                      },
                    });
                    return;
                  }

                  if (isLoggedIn === false) {
                    toast.show({
                      placement: "top",
                      render: ({ id }) => {
                        const toastId = "toast-" + id;
                        return (
                          <Toast
                            nativeID={toastId}
                            action="attention"
                            variant="solid"
                          >
                            <VStack space="xs">
                              <ToastTitle>🚨 Not Logged In</ToastTitle>
                              <ToastDescription>
                                Please log in to post a comment
                              </ToastDescription>
                            </VStack>
                          </Toast>
                        );
                      },
                    });
                    return;
                  }

                  // Add comment to in-memory store
                  dispatch(
                    addToInMemoryUserComment({
                      newState: {
                        id: Date.now(),
                        by: username || "unknown",
                        text: commentBody,
                        time: Math.floor(Date.now() / 1000),
                        parent: originalItemId,
                        type: "comment",
                      },
                    })
                  );

                  toast.show({
                    placement: "top",
                    render: ({ id }) => {
                      const toastId = "toast-" + id;
                      return (
                        <Toast
                          nativeID={toastId}
                          action="success"
                          variant="solid"
                        >
                          <VStack space="xs">
                            <ToastTitle>✅ Comment Added</ToastTitle>
                            <ToastDescription>
                              Your comment has been added locally
                            </ToastDescription>
                          </VStack>
                        </Toast>
                      );
                    },
                  });

                  setCommentBody(undefined);
                }}
              >
                Submit
              </Button>
            </Dialog.Close>
          </XStack>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default CommentDialog;
