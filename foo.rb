        components = {
          "modestbranding" => "1",
          "rel" => "",
          "showinfo" => "0"
        }

if not components["modestbranding"].nil? and not components["modestbranding"].empty?
  puts "modestbranding"
end
if not components["rel"].nil? and not components["rel"].empty?
  puts "rel"
end
