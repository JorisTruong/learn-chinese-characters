module.exports = {
  siteMetadata: {
    title: "Learn Chinese Characters",
    author: "Joris Truong",
    description: "Learn Chinese Characters"
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "data",
        path: `${__dirname}/src/resources/`,
      },
      __key: "data",
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        start_url: '/',
        icon: 'src/images/logo.svg',
      },
    },
    "gatsby-plugin-antd",
  ],
};
