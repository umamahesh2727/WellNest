import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import {
  User,
  Mail,
  Hash,
  Users,
  Weight,
  Ruler,
  Activity,
  Target,
  Globe,
  Calendar,
  Edit3,
  Save,
} from "lucide-react";
import Navigation from "../components/Navigation";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    fitnessLevel: "",
    goal: "",
    timezone: "",
    joinedDate: "",
  });

  const { toast } = useToast();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axiosInstance
      .get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfileData({
          ...res.data,
          joinedDate: res.data.joinedDate
            ? res.data.joinedDate.split("T")[0]
            : "",
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    axiosInstance
      .put("/auth/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // 🔥 Update state with fresh data returned from backend
        setProfileData({
          ...res.data,
          joinedDate: res.data.joinedDate
            ? res.data.joinedDate.split("T")[0]
            : "",
        });
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        });
        setIsEditing(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <Navigation />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">
                Profile Information
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <ProfileSection
              title="Personal Details"
              inputs={[
                { label: "Full Name", icon: User, field: "fullName" },
                { label: "Email Address", icon: Mail, field: "email" },
                { label: "Age", icon: Hash, field: "age", type: "number" },
              ]}
              selects={[
                {
                  label: "Gender",
                  icon: Users,
                  field: "gender",
                  options: ["male", "female", "other", "prefer_not_to_say"],
                },
              ]}
              data={profileData}
              onChange={handleInputChange}
              isEditing={isEditing}
            />

            <ProfileSection
              title="Health & Fitness"
              inputs={[
                {
                  label: "Weight",
                  icon: Weight,
                  field: "weight",
                  type: "number",
                  suffix: "kg",
                },
                {
                  label: "Height",
                  icon: Ruler,
                  field: "height",
                  type: "number",
                  suffix: "cm",
                },
              ]}
              selects={[
                {
                  label: "Fitness Level",
                  icon: Activity,
                  field: "fitnessLevel",
                  options: ["beginner", "intermediate", "advanced", "expert"],
                },
                {
                  label: "Primary Goal",
                  icon: Target,
                  field: "goal",
                  options: [
                    "weight_loss",
                    "muscle_gain",
                    "maintenance",
                    "endurance",
                    "strength",
                  ],
                },
              ]}
              data={profileData}
              onChange={handleInputChange}
              isEditing={isEditing}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-300">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileSelect
                  label="Timezone"
                  icon={Globe}
                  field="timezone"
                  value={profileData.timezone}
                  onChange={handleInputChange}
                  isEditing={isEditing}
                  options={[
                    "UTC-5",
                    "UTC+0",
                    "UTC+5",
                    "Asia/Kolkata",
                    "UTC+8",
                    "UTC+12",
                  ]}
                />
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Joined Date</span>
                  </label>
                  <input
                    type="date"
                    value={profileData.joinedDate}
                    onChange={(e) =>
                      handleInputChange("joinedDate", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full h-12 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                  <span className="text-xs text-slate-400">Member since</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4 border-t border-slate-700/30">
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-smooth shadow-lg shadow-indigo-500/30 font-medium flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Info</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

const ProfileSection = ({
  title,
  inputs = [],
  selects = [],
  data,
  onChange,
  isEditing,
}) => (
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-slate-300">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {inputs.map((input) => (
        <ProfileInput
          key={input.field}
          label={input.label}
          icon={input.icon}
          field={input.field}
          value={data[input.field]}
          onChange={onChange}
          isEditing={isEditing}
          type={input.type || "text"}
          suffix={input.suffix}
        />
      ))}
      {selects.map((select) => (
        <ProfileSelect
          key={select.field}
          label={select.label}
          icon={select.icon}
          field={select.field}
          value={data[select.field]}
          onChange={onChange}
          isEditing={isEditing}
          options={select.options}
        />
      ))}
    </div>
  </div>
);

const ProfileInput = ({
  label,
  icon: Icon,
  field,
  value,
  onChange,
  isEditing,
  type = "text",
  suffix,
}) => (
  <div className="space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
      <Icon className="w-4 h-4 text-indigo-400" />
      <span>{label}</span>
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(field, e.target.value)}
      disabled={!isEditing}
      placeholder={`Enter your ${field}`}
      className="w-full h-12 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
    />
    {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
  </div>
);

const ProfileSelect = ({
  label,
  icon: Icon,
  field,
  value,
  onChange,
  isEditing,
  options,
}) => (
  <div className="space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
      <Icon className="w-4 h-4 text-indigo-400" />
      <span>{label}</span>
    </label>
    <select
      value={value || ""}
      onChange={(e) => onChange(field, e.target.value)}
      disabled={!isEditing}
      className="w-full h-12 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
      style={{ color: "#fff" }}
    >
      {options.map((opt) => (
        <option
          key={opt}
          value={opt}
          style={{ color: "#1e293b", backgroundColor: "#f8fafc" }}
        >
          {opt}
        </option>
      ))}
    </select>
  </div>
);
