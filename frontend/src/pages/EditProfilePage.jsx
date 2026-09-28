import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Textarea } from "../components/textarea";
import { Switch } from "../components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { toast } from "sonner";
import { getUser } from "../utils/auth";
import {
  editAvatarPicture,
  editUser,
  getUserDetails,
  removeAvatarPicture,
} from "../api/userApi";

const EditProfilePage = () => {
  const [user, setUser] = useState(getUser());
  const fileInputRef = useRef(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [emailNotif, setEmailNotif] = useState(false);

  useEffect(() => {
    document.title = "Уреди профил";
  }, []);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      const updated = await editUser({
        firstName,
        lastName,
        phoneNumber: phone,
        location,
        biography: bio,
      });
      toast.success("Профилот е ажуриран");
      setUser(getUser());
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setBio(updated.biography ?? "");
      setLocation(updated.location ?? "");
      setPhone(updated.phoneNumber ?? "");
    } catch {
      toast.error("Не успеавме да ги зачуваме промените!");
    }
  };

  const handlePicture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Максимум 2MB слика!");
      return;
    }
    try {
      await editAvatarPicture(file);
      setUser(getUser());
      toast.success("Профилот е ажуриран");
    } catch {
      toast.error("Не успеавме да ја ажурираме сликата!");
    }
  };

  const handleRemovePicture = async () => {
    await removeAvatarPicture();
    setUser(getUser());
  };

  useEffect(() => {
    getUserDetails()
      .then((data) => {
        setUserDetails(data);
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setBio(data.biography ?? "");
        setLocation(data.location ?? "");
        setPhone(data.phoneNumber ?? "");
      })
      .catch(() => toast.error("Не успеавме да го вчитаме корисникот!"))
      .finally(() => setLoading(false));
  }, []);

  const initials = user.firstName[0] + user.lastName[0];

  if (loading) return <div />;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeButtonIndex={-1} />

      <main className="flex-1 pb-20 overflow-auto pt-14 lg:pt-0 lg:pb-0">
        <div className="max-w-3xl px-4 py-6 mx-auto sm:px-6 md:px-8 md:py-8">
         
          <div className="mb-6 sm:mb-8">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Назад на профил
            </Link>
            <h1 className="mt-3 text-xl font-bold sm:text-2xl md:text-3xl">
              Уреди профил
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ажурирај ги информациите за твојот профил
            </p>
          </div>

          <Tabs defaultValue="personal" className="w-full">
           
            <TabsList className="grid w-full h-auto grid-cols-3">
              <TabsTrigger
                value="personal"
                className="py-2 text-xs cursor-pointer sm:text-sm"
              >
                Лични податоци
              </TabsTrigger>
              <TabsTrigger
                value="picture"
                className="py-2 text-xs cursor-pointer sm:text-sm"
              >
                Профилна слика
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="py-2 text-xs cursor-pointer sm:text-sm"
              >
                Поставки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4 sm:mt-6">
              <form
                onSubmit={handleSavePersonal}
                className="p-4 space-y-5 border sm:p-6 bg-card border-border rounded-2xl card-elevated"
              >
                <div>
                  <h2 className="font-semibold">Лични информации</h2>
                  <p className="text-sm text-muted-foreground">
                    Ажурирај име, е-пошта и контакт детали
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Име</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Презиме</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+389 .."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Локација</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Град, Држава"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Биографија</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Кажи ни нешто за себе..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" className="w-full sm:w-auto">
                    Зачувај промени
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="picture" className="mt-4 sm:mt-6">
              <div className="p-4 space-y-5 border sm:p-6 bg-card border-border rounded-2xl card-elevated">
                <div>
                  <h2 className="font-semibold">Профилна слика</h2>
                  <p className="text-sm text-muted-foreground">
                    Прикачи нова профилна
                  </p>
                </div>

                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
                  <Avatar
                    key={user.avatarUrl ?? "no-avatar"}
                    className="w-20 h-20 sm:w-24 sm:h-24 shrink-0"
                  >
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={initials} />
                    ) : null}
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      <User className="w-8 h-8 sm:w-10 sm:h-10" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col w-full gap-2 sm:w-auto sm:flex-row">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handlePicture}
                    />
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" /> Прикачи нова слика
                    </Button>
                    {user.avatarUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleRemovePicture}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Отстрани слика
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-4 sm:mt-6">
              <div className="p-4 space-y-5 border sm:p-6 bg-card border-border rounded-2xl card-elevated">
                <div>
                  <h2 className="font-semibold">Поставки</h2>
                  <p className="text-sm text-muted-foreground">
                    Управувај со поставки
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 py-3 border-t border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      Известувања по е-пошта
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Добивај ажурирања за твоите придонеси
                    </p>
                  </div>
                  <Switch
                    checked={emailNotif}
                    onCheckedChange={setEmailNotif}
                    className="shrink-0"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default EditProfilePage;
