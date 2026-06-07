import { useAuth } from "../context/AuthContext";
import { useFormik } from "formik";
import { trpc } from "../lib/trpc";

export const AddMenuToUser = () => {
  const { user } = useAuth();
  const addMenuMutation = trpc.addMenuToUser.useMutation();
  const formik = useFormik({
    initialValues: {
      id: [] as number[],
    },
    onSubmit: async (values) => {
      const payload = {
        id: values.id,
      };
      try {
        await console.log(payload);
        addMenuMutation.mutateAsync(payload);
        window.location.href = `/users/${user?.id}`;
      } catch (error) {
        console.error("Ошибка:", error);
        alert(error instanceof Error ? error.message : "Ошибка сохранения");
      }
    },
  });

  const diets = [
    {
      id: 1,
      indications: [
        "язвенная болезнь желудка и двенадцатиперстной кишки в стадии обострения и нестойкой ремиссии",
        "острый гастрит",
        "хронический гастрит с нормальной и высокой кислотностью в стадии нерезкого обострения",
        "гастроэзофагеальная рефлюксная болезнь",
      ],
    },
    {
      id: 2,
      indications: [
        "хронический гастрит с пониженной кислотностью",
        "атрофический гастрит",
        "хронический колит вне обострения",
      ],
    },
    {
      id: 3,
      indications: [
        "хронические заболевания и функциональные расстройства кишечника, сопровождаемые запорами",
      ],
    },
    {
      id: 4,
      indications: [
        "острые и обострения хронических заболеваний кишечника, сопровождающиеся диареей (поносом)",
      ],
    },
    {
      id: 5,
      indications: [
        "хронический гепатит с доброкачественным и прогрессирующим течением",
        "цирроз печени вне обострения",
        "хронический холецистит",
        "желчнокаменная болезнь",
        "острый гепатит и холецистит в период выздоровления",
        "другие заболевания, сопровождающиеся нарушением функции печени и желчных путей",
      ],
    },
    {
      id: 6,
      indications: ["подагра", "мочекаменная болезнь с камнями-уратами"],
    },
    {
      id: 7,
      indications: [
        "острый нефрит в фазе выздоровления",
        "хронический нефрит вне обострения",
        "нефропатия беременных и другие заболевания, требующие бессолевой диеты",
      ],
    },
    {
      id: 8,
      indications: [
        "ожирение как основное заболевание или сопутствующее при других болезнях, не требующих специальных диет",
      ],
    },
    {
      id: 9,
      indications: [
        "сахарный диабет легкой и средней степени",
        "установление толерантности к углеводам",
        "подбор доз инсулина или других препаратов",
      ],
    },
    {
      id: 10,
      indications: [
        "атеросклероз с поражением сосудов сердца, головного мозга или других органов, повышенный холестерин крови",
        "ишемическая болезнь сердца",
        "артериальная гипертензия на фоне атеросклероза",
      ],
    },
    {
      id: 11,
      indications: [
        "туберкулез легких, костей, лимфатических узлов, суставов при нерезком обострении или его затухании, при пониженной массе тела",
        "истощение после инфекционных болезней, операции, травм",
      ],
    },
    {
      id: 12,
      indications: ["функциональные заболевания нервной системы"],
    },
    {
      id: 13,
      indications: ["острые инфекционные заболевания"],
    },
    {
      id: 14,
      indications: [
        "мочекаменная болезнь с камнями-фосфатами и щелочной реакцией мочи",
      ],
    },
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <h2>Укажите заболевания</h2>
      <h5>
        Укажите заболевания, которые у вас есть, чтобы мы могли определить какие
        рецепты вам ручше подобрать
      </h5>
      {diets.map((d) => (
        <div className="form-check">
          {d.indications.map((i) => (
            <label className="form-check-label">
              <input
                className="form-check-input"
                value={d.id}
                name="menu"
                type="checkbox"
                onChange={(e) => {
                  const newIds = formik.values.id.includes(e.target.value)
                    ? formik.values.id.filter((id) => id !== e.target.value)
                    : [...formik.values.id, Number(e.target.value)];

                  formik.setFieldValue("id", newIds);
                }}
              />
              {i}
            </label>
          ))}
        </div>
      ))}
      <button type="submit" className="btn">
        Добавить
      </button>
      <a href={`/users/${user?.id}`} className="btn btn-outline">
        Отмена
      </a>
    </form>
  );
};
