import { useContext, useEffect, useMemo, useState } from "react";
import {
  Camera,
  CircleX,
  Download,
  FileText,
  HeartPulse,
  Home,
  Info,
  Lock,
  Mail,
  Phone,
  Pill,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  Eye,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import apiService from "../services/api.service";
import { updateUser } from "../store/slices/authSlice";
import { AuthContext } from "../context/AuthProvider";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function cap(value) {
  if (!value) return "-";
  return value[0].toUpperCase() + value.slice(1);
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { logout } = useContext(AuthContext);
  const user = useSelector((state) => state.auth.user);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    mobile: "",
    address: "",
    state: "",
    district: "",
    pincode: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
  });
  const [profileFile, setProfileFile] = useState(null);

  const profile = useMemo(() => {
    const fullAddress = [
      user?.address,
      user?.district,
      user?.state,
      user?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      name: user?.username || "Patient",
      email: user?.email || "-",
      mobile: user?.mobile ? String(user.mobile) : "-",
      address: fullAddress || "-",
      role: user?.role || "user",
      avatar:
        user?.profileImage ||
        "https://images.unsplash.com/photo-1614436163996-25cee5f54290?q=80&w=400&auto=format&fit=crop",
      dob: formatDate(user?.personalDetails?.dob),
      gender: cap(user?.personalDetails?.gender),
      bloodGroup: user?.personalDetails?.bloodGroup || "-",
      emergencyName: user?.personalDetails?.emergencyContactName || "-",
      emergencyNumber: user?.personalDetails?.emergencyContactNumber || "-",
      updatedAt: formatDate(user?.updatedAt || user?.createdAt),
    };
  }, [user]);

  useEffect(() => {
    if (!user || !editOpen) return;
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      mobile: user.mobile ? String(user.mobile) : "",
      address: user.address || "",
      state: user.state || "",
      district: user.district || "",
      pincode: user.pincode || "",
      dob: user.personalDetails?.dob ? new Date(user.personalDetails.dob).toISOString().slice(0, 10) : "",
      gender: user.personalDetails?.gender || "",
      bloodGroup: user.personalDetails?.bloodGroup || "",
      emergencyContactName: user.personalDetails?.emergencyContactName || "",
      emergencyContactNumber: user.personalDetails?.emergencyContactNumber || "",
    });
    setProfileFile(null);
    setEditError("");
    setFieldErrors({});
  }, [editOpen, user]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;
    const bloodGroupRegex = /^(A|B|AB|O)[+-]$/i;
    const allowedGenders = new Set(["male", "female", "other", ""]);

    if (!editForm.username.trim()) errors.username = "Full name is required.";
    if (!editForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(editForm.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (editForm.mobile && !mobileRegex.test(editForm.mobile.trim())) {
      errors.mobile = "Mobile number must be 10 digits.";
    }

    if (editForm.emergencyContactNumber && !mobileRegex.test(editForm.emergencyContactNumber.trim())) {
      errors.emergencyContactNumber = "Emergency contact number must be 10 digits.";
    }

    if (editForm.pincode && !pincodeRegex.test(editForm.pincode.trim())) {
      errors.pincode = "Pincode must be 6 digits.";
    }

    if (!allowedGenders.has((editForm.gender || "").toLowerCase())) {
      errors.gender = "Gender must be male, female, or other.";
    }

    if (editForm.bloodGroup && !bloodGroupRegex.test(editForm.bloodGroup.trim())) {
      errors.bloodGroup = "Blood group format should be like O+, A-, AB+.";
    }

    if (editForm.dob) {
      const dob = new Date(editForm.dob);
      const now = new Date();
      if (Number.isNaN(dob.getTime())) {
        errors.dob = "Enter a valid date of birth.";
      } else if (dob > now) {
        errors.dob = "Date of birth cannot be in the future.";
      }
    }

    return errors;
  };

  const saveProfile = async () => {
    if (!user?._id) return;
    const validationErrors = validateForm();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setEditError("Please fix the highlighted fields.");
      return;
    }

    try {
      setSaving(true);
      setEditError("");

      const payload = {
        username: editForm.username,
        email: editForm.email,
        mobile: editForm.mobile,
        address: editForm.address,
        state: editForm.state,
        district: editForm.district,
        pincode: editForm.pincode,
        personalDetails: {
          dob: editForm.dob || undefined,
          gender: editForm.gender || undefined,
          bloodGroup: editForm.bloodGroup || undefined,
          emergencyContactName: editForm.emergencyContactName || undefined,
          emergencyContactNumber: editForm.emergencyContactNumber || undefined,
        },
      };

      const updateRes = await apiService.put(`/users/${user._id}`, payload);
      let nextUser = updateRes.data?.user || user;

      if (profileFile) {
        const imageForm = new FormData();
        imageForm.append("profile", profileFile);
        const uploadRes = await apiService.patch(`/users/${user._id}/upload-profile`, imageForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        nextUser = uploadRes.data?.user || nextUser;
      }

      dispatch(updateUser(nextUser));
      setEditOpen(false);
    } catch (error) {
      setEditError(error?.response?.data?.error || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-14 md:px-8">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100/50" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative">
              <img src={profile.avatar} alt={profile.name} className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{profile.name}</h1>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                  Premium Member
                </span>
              </div>
              <p className="max-w-xl text-sm text-slate-500">
                Last clinical checkup was recently recorded. Overall health status is marked as{" "}
                <span className="font-semibold text-emerald-600">Stable</span>.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-lg bg-[#0058be] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2170e4]"
              >
                Edit Profile
              </button>
              <button className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                Share
              </button>
              <button
                onClick={logout}
                className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">Personal Details</h2>
                <Info className="h-4 w-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-3">
                <Detail label="Date of Birth" value={profile.dob} />
                <Detail label="Gender" value={profile.gender} />
                <Detail label="Blood Group" value={profile.bloodGroup} highlight />
                <Detail label="Emergency Contact" value={profile.emergencyName} />
                <Detail label="Emergency Number" value={profile.emergencyNumber} />
                <Detail label="Role" value={cap(profile.role)} />
              </div>

              <div className="grid grid-cols-1 gap-6 border-t border-slate-100 bg-slate-50/60 px-6 py-6 md:grid-cols-2">
                <IconDetail icon={<Mail className="h-4 w-4" />} label="Email Address" value={profile.email} />
                <IconDetail icon={<Phone className="h-4 w-4" />} label="Phone Number" value={profile.mobile} />
                <div className="md:col-span-2">
                  <IconDetail icon={<Home className="h-4 w-4" />} label="Residential Address" value={profile.address} />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">Medical History Summary</h2>
                <button className="text-sm font-bold text-[#0058be] hover:underline">View Detailed Logs</button>
              </div>
              <div className="space-y-6 p-6">
                <div>
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Active Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Type 2 Diabetes", "Mild Hypertension", "Seasonal Asthma"].map((item) => (
                      <span key={item} className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                    <div className="mb-3 flex items-center gap-2 text-rose-600">
                      <TriangleAlert className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Allergies</h4>
                    </div>
                    <ul className="space-y-2 text-sm font-semibold text-slate-700">
                      <li>Penicillin</li>
                      <li>Peanuts</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                    <div className="mb-3 flex items-center gap-2 text-[#0058be]">
                      <Pill className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Current Medications</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center justify-between">
                        <span className="font-semibold">Metformin</span>
                        <span className="italic text-slate-500">500mg Daily</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="font-semibold">Lisinopril</span>
                        <span className="italic text-slate-500">10mg Daily</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">Medical Documents</h2>
                <button className="text-sm font-bold text-[#0058be] hover:underline">View All Documents</button>
              </div>
              <div className="space-y-2 p-4">
                {[
                  { title: "Annual Blood Work", type: "Lab Result", date: "Oct 12, 2023" },
                  { title: "Chest X-Ray Report", type: "Imaging", date: "Sep 28, 2023" },
                  { title: "Prescription - Lisinopril", type: "Prescription", date: "Aug 15, 2023" },
                ].map((doc) => (
                  <div key={doc.title} className="flex items-center justify-between rounded-lg border border-transparent p-3 hover:border-slate-100 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0058be]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{doc.title}</p>
                        <p className="text-[11px] text-slate-500">{doc.type} • {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="rounded-md p-2 text-slate-400 hover:bg-blue-50 hover:text-[#0058be]"><Eye className="h-4 w-4" /></button>
                      <button className="rounded-md p-2 text-slate-400 hover:bg-blue-50 hover:text-[#0058be]"><Download className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">Security & Privacy</h2>
              </div>
              <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500"><Lock className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Update Password</p>
                      <p className="text-[11px] text-slate-400">Last changed 4 months ago</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 text-[#0058be]"><ShieldCheck className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Two-Factor Auth</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Status: Active</p>
                    </div>
                  </div>
                  <div className="h-5 w-10 rounded-full bg-[#0058be] p-1">
                    <div className="ml-auto h-3 w-3 rounded-full bg-white" />
                  </div>
                </div>

                <hr className="border-slate-100" />
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Notification Preferences</h3>
                  {[
                    { label: "Email Alerts", checked: true },
                    { label: "SMS Reminders", checked: true },
                    { label: "Laboratory Reports", checked: false },
                  ].map((item) => (
                    <label key={item.label} className="flex items-center justify-between text-sm text-slate-700">
                      {item.label}
                      <input type="checkbox" defaultChecked={item.checked} className="rounded border-slate-300 text-[#0058be] focus:ring-[#0058be]/20" />
                    </label>
                  ))}
                </div>
              </div>
              <div className="px-6 pb-6">
                <button className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-black">Save Settings</button>
              </div>
            </section>

            <section className="rounded-2xl bg-gradient-to-br from-[#0058be] to-blue-700 p-6 text-white shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-2">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold">Patient Care Team</h3>
              </div>
              <p className="mb-5 text-xs leading-relaxed text-white/85">
                Need assistance with your records? Our clinical support team is available to help.
              </p>
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-white/40 bg-white/20 p-2">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold">Dr. Sarah Mitchell</p>
                  <p className="text-white/70">Primary Care Coordinator</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-7 text-xs md:flex-row md:items-center">
          <p className="font-medium text-slate-400">Profile last updated on {profile.updatedAt}</p>
          <div className="flex items-center gap-3 text-slate-500">
            <a href="#" className="font-bold hover:text-[#0058be]">Privacy Policy</a>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <a href="#" className="font-bold hover:text-[#0058be]">Data Management</a>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <a href="#" className="font-bold text-rose-600">Deactivate Account</a>
          </div>
        </footer>
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-900/45 px-4 pb-10 pt-24">
          <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Edit Profile</h2>
                <p className="text-sm text-slate-500">Update personal and contact details.</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
              >
                <CircleX className="h-5 w-5" />
              </button>
            </div>

            {editError ? (
              <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{editError}</p>
            ) : null}

            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
                <Camera className="h-4 w-4 text-[#0058be]" />
                Upload Profile Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                />
              </label>
              {profileFile ? <p className="mt-2 text-xs text-slate-500">{profileFile.name}</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Full Name" value={editForm.username} error={fieldErrors.username} onChange={(v) => {
                setEditForm((p) => ({ ...p, username: v }));
                setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }} />
              <Field label="Email" value={editForm.email} error={fieldErrors.email} onChange={(v) => {
                setEditForm((p) => ({ ...p, email: v }));
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }} />
              <Field label="Mobile" value={editForm.mobile} error={fieldErrors.mobile} onChange={(v) => {
                setEditForm((p) => ({ ...p, mobile: v }));
                setFieldErrors((prev) => ({ ...prev, mobile: undefined }));
              }} />
              <Field label="Date of Birth" type="date" value={editForm.dob} error={fieldErrors.dob} onChange={(v) => {
                setEditForm((p) => ({ ...p, dob: v }));
                setFieldErrors((prev) => ({ ...prev, dob: undefined }));
              }} />
              <Field label="Gender" value={editForm.gender} error={fieldErrors.gender} onChange={(v) => {
                setEditForm((p) => ({ ...p, gender: v }));
                setFieldErrors((prev) => ({ ...prev, gender: undefined }));
              }} />
              <Field label="Blood Group" value={editForm.bloodGroup} error={fieldErrors.bloodGroup} onChange={(v) => {
                setEditForm((p) => ({ ...p, bloodGroup: v }));
                setFieldErrors((prev) => ({ ...prev, bloodGroup: undefined }));
              }} />
              <Field label="State" value={editForm.state} onChange={(v) => setEditForm((p) => ({ ...p, state: v }))} />
              <Field label="District" value={editForm.district} onChange={(v) => setEditForm((p) => ({ ...p, district: v }))} />
              <Field label="Pincode" value={editForm.pincode} error={fieldErrors.pincode} onChange={(v) => {
                setEditForm((p) => ({ ...p, pincode: v }));
                setFieldErrors((prev) => ({ ...prev, pincode: undefined }));
              }} />
              <Field
                label="Emergency Contact Name"
                value={editForm.emergencyContactName}
                onChange={(v) => setEditForm((p) => ({ ...p, emergencyContactName: v }))}
              />
              <Field
                label="Emergency Contact Number"
                value={editForm.emergencyContactNumber}
                error={fieldErrors.emergencyContactNumber}
                onChange={(v) => {
                  setEditForm((p) => ({ ...p, emergencyContactNumber: v }));
                  setFieldErrors((prev) => ({ ...prev, emergencyContactNumber: undefined }));
                }}
              />
              <div className="md:col-span-2">
                <Field label="Address" value={editForm.address} onChange={(v) => setEditForm((p) => ({ ...p, address: v }))} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-lg bg-[#0058be] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Detail({ label, value, highlight = false }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <p className={`font-semibold ${highlight ? "text-rose-600" : "text-slate-900"}`}>{value || "-"}</p>
    </div>
  );
}

function IconDetail({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg border border-slate-200 bg-white p-2 text-[#0058be]">{icon}</div>
      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
        <p className="font-semibold text-slate-900">{value || "-"}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", error }) {
  return (
    <label className={`rounded-xl border px-3 py-2.5 text-sm ${error ? "border-rose-300 text-rose-700" : "border-slate-200 text-slate-600"}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 bg-transparent p-0 text-sm outline-none"
      />
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}

