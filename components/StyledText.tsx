import { Text as DefaultText, type TextProps } from "react-native";

export function Text(props: TextProps) {
	return (
		<DefaultText
			style={[{ fontFamily: "Minecraft" }, props.style]}
			{...props}
		/>
	);
}
