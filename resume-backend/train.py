# %% [markdown]
# # AI Resume Parser: Model Training (Job Category Classifier)
# Dataset: Snehaan Bhawal "Resume Dataset" (Resume.csv)
# Run each "# %%" block as one cell (VS Code: "Run Cell"), or run the whole file.
# Needs: resume_parser.py in the same folder (it provides clean()).

# %% Cell 1: Imports and load data
import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from resume_parser import clean

os.makedirs("model", exist_ok=True)

CSV_PATH = "data/Resume.csv"          # change if your file is in another folder

df = pd.read_csv(CSV_PATH)
df = df[["Resume_str", "Category"]].dropna()
df = df.drop_duplicates(subset="Resume_str").reset_index(drop=True)
df["clean"] = df["Resume_str"].apply(clean)
df = df[df["clean"].str.len() > 50].reset_index(drop=True)   # drop near-empty rows

print("Total resumes:", len(df))
print("Categories   :", df["Category"].nunique())
print(df["Category"].value_counts())

# %% Cell 1b: Class distribution plot (for the report)
plt.figure(figsize=(9, 7))
df["Category"].value_counts().sort_values().plot(kind="barh")
plt.title("Resumes per category")
plt.xlabel("Count")
plt.tight_layout()
plt.savefig("model/class_distribution.png", dpi=150)
plt.show()

# %% Cell 2: Train/test split, then tune Logistic Regression with 5-fold CV
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

y = df["Category"]
Xtr_txt, Xte_txt, ytr, yte = train_test_split(
    df["clean"], y, test_size=0.2, stratify=y, random_state=42
)
print("Train:", len(Xtr_txt), "| Test:", len(Xte_txt))

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english", sublinear_tf=True)),
    ("clf", LogisticRegression(max_iter=2000)),
])
params = {
    "tfidf__ngram_range": [(1, 1), (1, 2)],
    "tfidf__max_features": [10000, 20000],
    "clf__C": [1, 10, 100],
}
gs = GridSearchCV(
    pipe, params,
    cv=StratifiedKFold(5, shuffle=True, random_state=42),
    scoring="f1_macro", n_jobs=-1, verbose=1,
)
gs.fit(Xtr_txt, ytr)

print("Best params      :", gs.best_params_)
print("Best CV macro F1 :", round(gs.best_score_, 3))

# %% Cell 3: Final features and model comparison
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

bp = gs.best_params_
vec = TfidfVectorizer(
    stop_words="english", sublinear_tf=True,
    ngram_range=bp["tfidf__ngram_range"],
    max_features=bp["tfidf__max_features"],
)
Xtr = vec.fit_transform(Xtr_txt)      # fit on training data only
Xte = vec.transform(Xte_txt)

lr = LogisticRegression(C=bp["clf__C"], max_iter=2000)
rf = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1)
svm = CalibratedClassifierCV(LinearSVC(), cv=3)

models = {
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Logistic Regression (tuned)": lr,
    "Random Forest": rf,
    "Ensemble (LR + RF + SVM)": VotingClassifier(
        [("lr", lr), ("rf", rf), ("svm", svm)], voting="soft"
    ),
}

rows = []
for name, m in models.items():
    print("Training:", name)
    m.fit(Xtr, ytr)
    p = m.predict(Xte)
    rows.append({
        "Model": name,
        "Accuracy": accuracy_score(yte, p),
        "Precision": precision_score(yte, p, average="macro", zero_division=0),
        "Recall": recall_score(yte, p, average="macro", zero_division=0),
        "F1": f1_score(yte, p, average="macro", zero_division=0),
    })

results = pd.DataFrame(rows).round(3).sort_values("F1", ascending=False)
results.to_csv("model/model_comparison.csv", index=False)
print(results.to_string(index=False))

# %% Cell 4: Best model report and confusion matrix
from sklearn.metrics import classification_report, ConfusionMatrixDisplay

best_name = results.iloc[0]["Model"]
best = models[best_name]
print("Best model:", best_name)

pred = best.predict(Xte)
print(classification_report(yte, pred, zero_division=0))

fig, ax = plt.subplots(figsize=(12, 12))
ConfusionMatrixDisplay.from_predictions(
    yte, pred, ax=ax, xticks_rotation=90, colorbar=False
)
plt.title(f"Confusion Matrix: {best_name}")
plt.tight_layout()
plt.savefig("model/confusion_matrix.png", dpi=150)
plt.show()

# %% Cell 5: Unsupervised part (K-Means + PCA)
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import adjusted_rand_score, silhouette_score

# smaller feature set so PCA stays light on memory
vec_c = TfidfVectorizer(stop_words="english", sublinear_tf=True, max_features=3000)
Xc = vec_c.fit_transform(df["clean"])

k = df["Category"].nunique()
km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(Xc)
print("K-Means clusters           :", k)
print("Agreement with categories  :", round(adjusted_rand_score(df["Category"], km.labels_), 3), "(ARI)")

pca = PCA(n_components=2, random_state=42)
pts = pca.fit_transform(Xc.toarray())
print("Variance explained by 2 PCs:", round(pca.explained_variance_ratio_.sum(), 3))

plt.figure(figsize=(9, 7))
plt.scatter(pts[:, 0], pts[:, 1], c=km.labels_, cmap="tab20", s=12)
plt.title("K-Means clusters visualised with PCA (2D)")
plt.xlabel("PC1")
plt.ylabel("PC2")
plt.tight_layout()
plt.savefig("model/kmeans_pca.png", dpi=150)
plt.show()

# how each real category spreads across the clusters (top rows)
print(pd.crosstab(df["Category"], km.labels_).head(10))

# %% Cell 6: Save the best model and the vectorizer
joblib.dump(best, "model/model.pkl")
joblib.dump(vec, "model/vectorizer.pkl")
print("Saved: model/model.pkl and model/vectorizer.pkl")

# %% Cell 7: Quick sanity test (same steps the API will use)
sample = df["Resume_str"].iloc[0]
proba = best.predict_proba(vec.transform([clean(sample)]))[0]
i = int(proba.argmax())
print("Actual    :", df["Category"].iloc[0])
print("Predicted :", best.classes_[i], f"({proba[i] * 100:.1f}%)")
