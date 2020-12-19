import React from "react"
import Helmet from "react-helmet"

const NotFoundPage = () => (
  <div>
    <Helmet title="Learn Chinese Characters">
      <script src="js/common/jquery.min.js"></script>
      <script src="js/common/bootstrap.min.js"></script>
    </Helmet>
    <div class="kenburns" />
    <div style={{ position: "fixed", top: "50%", "left": "50%", transform: "translate(-50%, -50%)", zIndex: 9 }}>
      <div style={{ padding: "0 5%", opacity: 1, visibility: "visible", width: "75%" }}>
          <div class="message">
              NOT FOUND <br/>
              <span>You just hit a route that doesn&#39;t exist... the sadness.</span>
          </div>
      </div>
    </div>
  </div>
)

export default NotFoundPage
