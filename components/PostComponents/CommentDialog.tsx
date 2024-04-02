import { Entypo } from "@expo/vector-icons";
import {
  Toast,
  VStack,
  ToastTitle,
  ToastDescription,
  useToast,
} from "@gluestack-ui/themed";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  Adapt,
  Button,
  Sheet,
  Unspaced,
  XStack,
  TextArea,
} from "tamagui";
import { ReduxStoreInterface } from "../../Redux/store";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import { useState } from "react";
import { addToInMemoryUserComment } from "../../Redux/authUserReducer";

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
        <Entypo name="reply" size={15} color="black" />
      </Dialog.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quicker",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Description size={"$3"}>
            Reply To: {originalItemContent}
          </Dialog.Description>

          <TextArea
            size="$5"
            borderWidth={2}
            placeholder={`@${originalAuthor}`}
            autoFocus={true}
            // value={commentBody}
            onChangeText={setCommentBody}
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
                aria-label="Close"
                onPress={async () => {
                  if (!isLoggedIn) {
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
                              <ToastTitle>
                                🚨 Please login before attempting to comment
                              </ToastTitle>
                              <ToastDescription>
                                Double check you've logged in
                              </ToastDescription>
                            </VStack>
                          </Toast>
                        );
                      },
                    });
                    return;
                  }

                  if (!commentBody) {
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
                              <ToastTitle>
                                🚨 Please enter a comment body first
                              </ToastTitle>
                            </VStack>
                          </Toast>
                        );
                      },
                    });
                    return;
                  }

                  /**
                   * Attempt to comment
                   */
                  const response = await HackerNewsClient.writeComment(
                    originalItemId,
                    commentBody
                  );

                  if (response === false) {
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
                              <ToastTitle>🚨 Error Commenting</ToastTitle>
                              <ToastDescription>
                                Something went wrong 😕
                              </ToastDescription>
                            </VStack>
                          </Toast>
                        );
                      },
                    });
                    return;
                  }

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
                            <ToastTitle>🙌 Success</ToastTitle>
                          </VStack>
                        </Toast>
                      );
                    },
                  });

                  /**
                   * Save this comment, so it shows up in the post
                   * immidietly
                   */
                  dispatch(
                    addToInMemoryUserComment({
                      itemId: originalItemId,
                      comment: {
                        id: -1,
                        author: username ?? "[ME]",
                        created_at: new Date().toISOString(),
                        created_at_i: Math.floor(Date.now() / 1000),
                        children: [],
                        options: [],
                        parent_id: originalItemId,
                        points: 0,
                        story_id: originalItemId,
                        text: commentBody,
                        type: "comment",
                      },
                    })
                  );
                  return;
                }}
              >
                Submit
              </Button>
            </Dialog.Close>
          </XStack>

          <Dialog.Description size={"$1"}>
            Note: Comments can take up to 5 minutes to appear due to the Algolia
            database being delayed.
          </Dialog.Description>

          <Unspaced>
            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$3"
                right="$3"
                size="$2"
                circular
              />
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default CommentDialog;
