const fs = require('fs')
const path = require('path')

const rootDirs = ['/app', '/hooks', '/layouts', '/styles']
const configFiles = [
  {
    filePath: 'tailwind.config.js',
    patterns: ['darkmode:\\s*{[^}]*},', 'darkMode:\\s*"class",'],
  },
  { filePath: '/config/theme.json', patterns: ['colors.darkmode'] },
]

rootDirs.forEach(removeDarkModeFromPages)
configFiles.forEach(removeDarkMode)

function removeDarkModeFromFiles(filePath, regexPatterns) {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  let updatedContent = fileContent
  regexPatterns.forEach((pattern) => {
    const regex = new RegExp(pattern, 'g')
    updatedContent = updatedContent.replace(regex, '')
  })
  fs.writeFileSync(filePath, updatedContent, 'utf8')
}

function removeDarkModeFromPages(directoryPath) {
  const files = fs.readdirSync(directoryPath)

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      removeDarkModeFromPages(filePath)
    } else if (stats.isFile()) {
      removeDarkModeFromFiles(filePath, ['(?:(?!["])\\S)*dark:(?:(?![,;"])\\S)*'])
    }
  })
}

function removeDarkMode(configFile) {
  const { filePath, patterns } = configFile
  if (filePath === 'tailwind.config.js') {
    removeDarkModeFromFiles(filePath, patterns)
  } else {
    const contentFile = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    patterns.forEach((pattern) => deleteNestedProperty(contentFile, pattern))
    fs.writeFileSync(filePath, JSON.stringify(contentFile))
  }
}

function deleteNestedProperty(obj, propertyPath) {
  const properties = propertyPath.split('.')
  let currentObj = obj
  for (let i = 0; i < properties.length - 1; i++) {
    const property = properties[i]
    if (Object.prototype.hasOwnProperty.call(currentObj, property)) {
      currentObj = currentObj[property]
    } else {
      return
    }
  }
  delete currentObj[properties[properties.length - 1]]
}
