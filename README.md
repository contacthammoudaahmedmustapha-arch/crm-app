# CRM Pro — React + Vercel + Aiven MySQL

Application CRM complète avec authentification, gestion des contacts et des utilisateurs.

---

## Stack technique
- **Frontend** : React 18 + Tailwind-like CSS custom + jQuery (search)
- **Backend** : Vercel Serverless Functions (Node.js)
- **Base de données** : Aiven MySQL (cloud)
- **Auth** : JWT + bcrypt
- **Charts** : Recharts
- **Export** : SheetJS (xlsx)

---

## Étape 1 — Créer la base de données sur Aiven

1. Créez un compte sur [aiven.io](https://aiven.io)
2. Créez un service **MySQL** (plan Free)
3. Copiez les credentials : host, port, user, password, database
4. Connectez-vous à votre DB (via DBeaver ou le terminal Aiven)
5. Exécutez le fichier `schema.sql` :
   ```sql
   -- Collez le contenu de schema.sql dans la console Aiven
   ```

---

## Étape 2 — Variables d'environnement

Créez un fichier `.env` à la racine (pour le dev local) :
```env
AIVEN_HOST=mysql-xxxx.aivencloud.com
AIVEN_PORT=3306
AIVEN_USER=avnadmin
AIVEN_PASSWORD=votre_mot_de_passe
AIVEN_DATABASE=defaultdb
JWT_SECRET=un_secret_long_et_aleatoire_ici
```

---

## Étape 3 — Générer le hash bcrypt pour le premier admin

```bash
node -e "const b=require('bcryptjs'); b.hash('VotreMotDePasse',10).then(console.log)"
```

Remplacez le hash dans `schema.sql` avant de l'exécuter.

---

## Étape 4 — Déploiement sur Vercel

1. Poussez le code sur GitHub
2. Importez le projet sur [vercel.com](https://vercel.com)
3. Ajoutez les variables d'environnement dans **Settings > Environment Variables** :
   - `AIVEN_HOST`
   - `AIVEN_PORT`
   - `AIVEN_USER`
   - `AIVEN_PASSWORD`
   - `AIVEN_DATABASE`
   - `JWT_SECRET`
4. Déployez !

---

## Fonctionnalités

### Tous les utilisateurs
- ✅ Login / Logout avec JWT
- ✅ Liste des contacts avec recherche live (jQuery AJAX)
- ✅ Ajouter un contact
- ✅ Modifier **ses propres contacts uniquement**
- ❌ Supprimer : interdit aux utilisateurs simples

### Admin
- ✅ Toutes les fonctions utilisateur
- ✅ Modifier & supprimer **tous** les contacts
- ✅ Export XLSX de tous les contacts
- ✅ Dashboard avec statistiques et graphiques
- ✅ Gérer les utilisateurs (créer, modifier, activer/désactiver, reset password)

---

## Structure du projet

```
crm-app/
├── api/
│   ├── _db.js              # Connexion MySQL pool
│   ├── _auth.js            # Middleware JWT
│   ├── auth/login.js       # POST /api/auth/login
│   ├── contacts/
│   │   ├── index.js        # GET /api/contacts, POST /api/contacts
│   │   └── [id].js         # GET/PUT/DELETE /api/contacts/:id
│   ├── users/
│   │   ├── index.js        # GET /api/users, POST /api/users
│   │   └── [id].js         # PUT /api/users/:id
│   └── stats/index.js      # GET /api/stats
├── src/
│   ├── context/AuthContext.jsx
│   ├── utils/api.js
│   ├── hooks/useToast.js
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Toast.jsx
│   │   ├── ContactModal.jsx
│   │   └── UserModal.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Contacts.jsx
│   │   ├── Users.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── schema.sql
├── vercel.json
└── package.json
```

---

## Règles métier implémentées

| Règle | Implémentation |
|-------|---------------|
| User modifie seulement ses contacts | Vérification `created_by === username` côté API |
| Seul admin supprime | Vérification `role === 'admin'` côté API |
| Recherche live | jQuery debounce 200ms, filtre client-side |
| Export XLSX | SheetJS, admin only |
| Reset password sans ancien MDP | Action séparée côté API |
| Désactiver/activer user | Toggle `active` flag, bloqué au login |
