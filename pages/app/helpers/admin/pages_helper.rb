module Admin
  module PagesHelper
    def page_templates_collection
      Page.templates.reject {|t| t == "show"}.map {|t| [t, t]}
    end
  end
end
