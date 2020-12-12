module.exports = {
  siteMetadata: {
    title: "Learn Chinese Characters",
    author: "Joris Truong",
    description: "Learn Chinese Characters"
  },
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    "gatsby-plugin-antd",
  ],
};
