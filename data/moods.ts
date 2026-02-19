import Colors from "@/constants/colors";

export interface MoodOption {
  index: number;
  label: string;
  icon: string;
  color: string;
}

export const moodOptions: MoodOption[] = [
  { index: 0, label: "Cok Kotu", icon: "sad-outline", color: Colors.moodBad },
  { index: 1, label: "Kotu", icon: "rainy-outline", color: Colors.moodSad },
  { index: 2, label: "Normal", icon: "partly-sunny-outline", color: Colors.moodNeutral },
  { index: 3, label: "Iyi", icon: "sunny-outline", color: Colors.moodGood },
  { index: 4, label: "Harika", icon: "heart-outline", color: Colors.moodHappy },
];
