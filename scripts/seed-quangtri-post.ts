import { getPayload } from 'payload'
import config from '../src/payload/payload.config'

async function seedQuangTriPost() {
  const payload = await getPayload({ config })

  // Related guide + tour type (idempotent lookups, non-fatal if absent)
  const tuCaoRes = await payload.find({ collection: 'guides', where: { name: { equals: 'Tu Cao' } }, limit: 1, depth: 0 })
  const culturalRes = await payload.find({ collection: 'tour-types', where: { title: { equals: 'Cultural' } }, limit: 1, depth: 0 })
  const relatedGuides = tuCaoRes.docs[0] ? [(tuCaoRes.docs[0] as { id: string | number }).id] : []
  const relatedTourTypes = culturalRes.docs[0] ? [(culturalRes.docs[0] as { id: string | number }).id] : []

  // Create the blog post
  const post = await payload.create({
    collection: 'posts',
    data: {
      type: 'post',
      title: 'Bản Đồ Chiến Lược Lịch Sử Quảng Trị - 14 Địa Danh Lưu Dấu',
      slug: 'ban-do-chien-luoc-lich-su-quang-tri',
      status: 'published',
      locale: 'vi',
      excerpt: 'Khám phá 14 địa danh lịch sử tiêu biểu của Quảng Trị - vùng đất lửa anh hùng, từ Địa đạo Vĩnh Mốc đến Thành cổ Quảng Trị, Căn cứ Khe Sanh và Đại lộ Kinh hoàng.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Quảng Trị - vùng đất lửa anh hùng, nơi lưu giữ những dấu ấn lịch sử sâu đậm nhất của cuộc kháng chiến chống Mỹ. Từ sông Bến Hải đến Đường 9, từ Địa đạo Vĩnh Mốc đến Thành cổ Quảng Trị, mỗi tấc đất ở đây đều gắn liền với những câu chuyện chiến đấu anh dũng của quân và dân ta.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '1. Địa Đạo Vĩnh Mốc - Thành Phố Ngầm Trong Lửa Đạn'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Nằm ở phía Bắc sông Bến Hải, địa đạo Vĩnh Mốc là kỳ tích về sự sinh tồn dưới bom đạn Mỹ. Do bị nghi ngờ là trạm trung chuyển tiếp tế cốt tử cho đảo tiền tiêu Cồn Cỏ bằng thuyền nan vượt biển, khu vực này bị dội mưa bom bão đạn tàn khốc. Người dân đã đào sâu lòng đất thành một "thành phố ngầm" tinh vi để vừa sống, vừa bám trụ sản xuất, tiếp đạn cho miền Nam.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '2. Cầu Hiền Lương - Nhân Chứng Lịch Sử Đau Thương'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Theo Hiệp định Genève năm 1954, sông Bến Hải tại vĩ tuyến 17 được chọn làm giới tuyến quân sự tạm thời chia cắt hai miền Nam - Bắc. Cầu Hiền Lương bắc qua sông trở thành nhân chứng lịch sử đau thương nhưng hào hùng cho khát vọng thống nhất của dân tộc, với các cuộc "đấu loa", "đấu cờ" rực lửa giữa hai bờ sông.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '3. Thành Cổ Quảng Trị - 81 Ngày Đêm Khốc Liệt'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Được khởi dựng từ thời Gia Long và Minh Mạng làm thành lũy phòng thủ hành chính, nhưng danh tiếng lẫy lừng của Thành Cổ gắn liền với cuộc đọ sức 81 ngày đêm khốc liệt năm 1972. Tại đây, cả hai bờ chiến tuyến đều dốc toàn bộ hỏa lực tàn khốc để chiếm giữ, nhằm tạo lợi thế thương lượng quyết định trên bàn đàm phán Paris. "Mỗi mét vuông đất là một mét máu" - lời di chúc bất tử của các chiến sĩ.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '4. Căn Cứ Khe Sanh - Cuộc Vây Hãm 170 Ngày Đêm'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Mỹ xây dựng sân bay và tổ hợp căn cứ đồ sộ tại thung lũng Khe Sanh từ năm 1962 như một "mỏ neo" chiến thuật hướng Tây. Đây là chốt chặn chính yếu để cắt đứt các đường tiếp tế từ Lào sang của Quân giải phóng, cũng là nơi diễn ra chiến dịch vây hãm 170 ngày đêm chấn động toàn cầu năm 1968 với trung tâm cốt lõi là Sân bay dã chiến Tà Cơn.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '5. Đồi Rockpile - Mắt Thần Quan Sát Tầm Cao'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Một khối núi đá vôi dốc đứng cao 230 mét, nổi bật giữa thung lũng hiểm trở. Năm 1966, Thủy quân lục chiến Mỹ chiếm lĩnh điểm cao này bằng trực thăng để xây dựng đài quan sát tầm cao tuyệt đối. Từ đây, Mỹ giám sát mọi chuyển động xung quanh Đường 9 và trực tiếp chỉ đạo hỏa lực pháo binh tầm xa.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '6. Pháo Đài Camp Carroll - Vương Quốc Pháo Binh'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Camp Carroll là căn cứ pháo binh quy mô khổng lồ của Thủy quân lục chiến Mỹ đặt tại Đường 9. Trọng tâm của căn cứ là trận địa đại bác tự hành 175mm tầm xa "vua chiến trường", có khả năng xoay hướng nã đạn bảo vệ cho cả Rockpile ở phía Tây lẫn Cồn Tiên ở phía Bắc. Sự kiện toàn bộ sĩ quan binh lính tại đây đầu hàng năm 1972 đã bẻ gãy xương sống hệ thống phòng ngự Đường 9.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '7. Sân Bay Tà Cơn - Cầu Hàng Không Sống Còn'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Sân bay Tà Cơn là trung tâm cốt lõi duy trì sự sống của thung lũng Khe Sanh. Được Mỹ mở rộng từ năm 1965 với đường băng vỉ sắt dã chiến dài hơn 1200m phục vụ cho các máy bay vận tải C-123 và C-130 Hercule. Trong chiến dịch vây hãm năm 1968, khi toàn bộ Đường 9 bị Quân Giải phóng khóa chặt, Tà Cơn là lối thoát hiểm duy nhất.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '8. Đảo Cồn Cỏ - Mắt Thần Biển Đông'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Đảo Cồn Cỏ có diện tích nhỏ nhưng chiếm vị trí quân sự cực kỳ đắc địa ngoài khơi vĩ tuyến 17. Đối với miền Bắc, đảo là tiền đồn bảo vệ không phận, hải phận, đồng thời là "mắt thần" thu phát radar cảnh giới sớm các máy bay, tàu chiến Mỹ đánh phá miền Bắc. Đứng vững kiên cường trước làn sóng oanh tạc của Mỹ, Cồn Cỏ hai lần được phong tặng danh hiệu Anh hùng lực lượng vũ trang nhân dân.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '9. Đại Lộ Kinh Hoàng - Thảm Kịch Nhân Đạo 1972'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Đây là tên gọi đau thương dành cho một đoạn của Quốc lộ 1A đi qua huyện Hải Lăng, mạn cực Nam Quảng Trị. Vào ngày 01/05/1972, khi chiến sự Mùa hè đỏ lửa bùng nổ dữ dội ở Quảng Trị, hàng vạn người dân thường vô tội cùng binh lính tháo chạy hỗn loạn về phía Huế trên trục lộ này. Đoạn đường chật cứng phương tiện đã phải gánh chịu những đợt pháo kích dữ dội.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: '10. Thánh Địa La Vang - Biểu Tượng Đức Tin'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'La Vang là thánh địa Công giáo quan trọng bậc nhất của Việt Nam, nằm ở huyện Hải Lăng. Trong chiến dịch tái chiếm Quảng Trị hè năm 1972, thánh điện đã nằm ngay tâm bão lửa của hỏa lực bom đạn dội xuống từ cả hai phía. Toàn bộ công trình đồ sộ bị san phẳng hoàn toàn, chỉ còn lại tháp chuông cổ rêu phong lỗ chỗ vết đạn sững sững giữa trời xanh. Tháp chuông La Vang đổ nát ngày nay đã trở thành biểu tượng thiêng liêng của hòa bình và sức sống đức tin kiên cường qua chiến tranh.'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: 'Kết Luận'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Quảng Trị không chỉ là một tỉnh miền Trung Việt Nam, mà là một bảo tàng sống về lịch sử kháng chiến. Mỗi địa danh ở đây đều kể một câu chuyện riêng về sự hy sinh, lòng dũng cảm và khát vọng hòa bình. Hôm nay, khi đến thăm Quảng Trị, du khách không chỉ được chiêm ngưỡng cảnh sắc thiên nhiên hùng vĩ mà còn được nghe những câu chuyện lịch sử cảm động, được chạm vào những di tích đã in dấu máu xương của bao thế hệ.'
                }
              ]
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      publishedAt: new Date().toISOString(),
      relatedGuides,
      relatedTourTypes,
    } as never,
  })

  console.log(`Created blog post: ${post.id} - ${post.title}`)
  console.log(`Slug: ${post.slug}`)

  process.exit(0)
}

seedQuangTriPost().catch((err) => {
  console.error(err)
  process.exit(1)
})
