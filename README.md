# Hackaton-2024
# Error Points Counter - VSCode Plugin

## Description
**Error Points Counter** est un plugin pour Visual Studio Code qui permet de compter automatiquement les points d’erreur dans votre code. Affiche un score total de points d’erreur en fonction de la gravité des problèmes rencontrés.

L’objectif est d’aider les développeurs à maintenir un code propre et sans erreurs en surveillant un score d’erreur global.

## Fonctionnalités
- **Attribution de points d’erreur** : Chaque type d’erreur détectée se voit attribuer un nombre de points, basé sur sa gravité.
- **Affichage des points d’erreur** : Affiche le total des points d’erreur dans la barre d'état de VSCode.
- **Compatibilité multi-langages** : Fonctionne avec un langages de programmation courants.

## Installation

1. **Installation depuis le marketplace :**
   - Ouvrez VSCode.
   - Allez dans l'onglet **Extensions** (ou utilisez `Ctrl+Shift+X`).
   - Recherchez `Error Points Counter alexendre`.
   - Cliquez sur **Installer**.

2. **Installation manuelle :**
   - Clonez ce dépôt sur votre machine :
     ```bash
     git clone https://github.com/folecrom/Hackaton-2024.git
     ```

## Utilisation

1. Ouvrez un fichier de code dans VSCode.
2. Pointer les erreurs double click 
3. Le total des points d'erreur sera affiché dans une page html.

### Exemples de points d’erreur :
- **Variable non définie** : 5 points
- **Parenthèses non fermées** : 3 points
- **Mot clé manquant** : 4 points
- **Erreur de syntaxe générale** : 2 points

## Contribution

Si vous souhaitez contribuer à ce projet :
1. Fork le dépôt.
2. Créez une branche pour vos modifications (`git checkout -b nouvelle-fonctionnalité`).
3. Commitez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`).
4. Poussez la branche (`git push origin nouvelle-fonctionnalité`).
5. Créez une Pull Request.

## Problèmes et Suggestions

Si vous rencontrez un problème ou avez une suggestion pour améliorer ce plugin, veuillez créer une issue dans le [dépôt GitHub](https://github.com/votre-utilisateur/error-points-counter/issues).

## Licence

Ce projet est sous licence MIT. Consultez le fichier [LICENSE](./LICENSE) pour plus de détails.
