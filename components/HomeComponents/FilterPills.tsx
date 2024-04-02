import { useState } from "react";
import { View, Text } from "tamagui";
import { mainPurple } from "../../utils/main.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { FilterData, setFilterSelected } from "../../Redux/homeScreenReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import { useDispatch, useSelector } from "react-redux";

const FilterPill: React.FC<{
  data: FilterData;
}> = ({ data }) => {
  const filteredSelected = useSelector(
    (state: ReduxStoreInterface) => state.homeScreen.filterSelected
  );
  const dispatch = useDispatch();

  const selected = filteredSelected?.title === data.title;
  return (
    <View
      key={data.title}
      padding={5}
      backgroundColor={selected === true ? mainPurple : "white"}
      borderRadius={10}
      marginHorizontal={2}
    >
      <TouchableOpacity
        onPress={() => {
          dispatch(setFilterSelected({ newState: data }));
        }}
      >
        <Text fontSize={"$5"} color={selected === true ? "white" : "black"}>
          {data.title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
export default FilterPill;
